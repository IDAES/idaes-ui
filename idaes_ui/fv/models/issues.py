"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

# stdlib
from enum import Enum
from typing import Dict, Union, List, Tuple

# third-party
from pydantic import BaseModel

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd

# Import other needed IDAES types
from pyomo.core.base.block import _BlockData
from pyomo.environ import value
from pyomo.util.check_units import identify_inconsistent_units

from .base import DiagnosticsException

# Exceptions


class DiagnosticsUpdateException(DiagnosticsException):
    """Error updating diagnostics"""

    def __init__(self, name="unknown", details=None):
        super().__init__(name=name, details=details)


# Diagnostics


class Severity(str, Enum):
    warning = "warning"
    error = "error"
    caution = "caution"


class ModelObjectType(str, Enum):
    component = "component"
    constraint = "constraint"
    var = "var"
    bounded_var = "var+bounds"
    param = "param"
    objective = "objective"
    set = "set"


class ModelIssueType(str, Enum):
    numerical = "numerical"
    structural = "structural"


# Objects in a list for a given issue


class ModelIssueBase(BaseModel):
    """Base type for individual objects in an issue."""

    type: ModelObjectType
    name: str  # usually path to model object


class ModelIssueComponent(ModelIssueBase):
    type: ModelObjectType = ModelObjectType.component


class ModelIssueVariable(ModelIssueBase):
    """Variable object in an issue."""

    type: ModelObjectType = ModelObjectType.var
    value: Union[float, None] = 0.0
    fixed: bool = False


class ModelIssueVariableBounded(ModelIssueBase):
    """Variable and its bounds in an issue."""

    type: ModelObjectType = ModelObjectType.bounded_var
    value: float = 0.0
    lower: float = 0.0
    has_lower: bool = True
    upper: float = 0.0
    has_upper: bool = True


class ModelIssueConstraint(ModelIssueBase):
    """Constraint in a model issue."""

    type: ModelObjectType = ModelObjectType.constraint
    body: str  # string-ized version of the constraint
    # TODO: Add more information about the constraint


# Model issue


class ModelIssue(BaseModel):
    type: ModelIssueType
    severity: Severity
    modifiers: Dict[str, str] = {}  # additional semi-structured info
    name: str = ""
    description: str = ""
    objects: List[
        Union[
            ModelIssueVariable,
            ModelIssueVariableBounded,
            ModelIssueConstraint,
            ModelIssueComponent,
        ]
    ] = []


# Container for list of model issues


class ModelIssues(BaseModel):
    issues: List[ModelIssue] = []

    def __init__(self, block: _BlockData, **kwargs):
        super().__init__()
        self._block = block
        self._config = imd.CONFIG(**kwargs)
        self._tbx = imd.DiagnosticsToolbox(self._block, **self._config)

    def update(self):
        self.issues = []  # clear old
        self._add_inconsistent_units()
        self._add_structural_singularities()
        self._add_extreme_values()
        self._add_variables_near_bounds()
        self._add_not_in_act_constr()

    def _add_extreme_values(self):
        c = self._config
        objs = [
            ModelIssueVariable(name=v.name, value=v.value, fixed=v.fixed)
            for v in imd._vars_with_extreme_values(
                model=self._block,
                large=c.variable_large_value_tolerance,
                small=c.variable_small_value_tolerance,
                zero=c.variable_zero_value_tolerance,
            )
        ]
        if objs:
            issue = ModelIssue(
                type=ModelIssueType.numerical,
                severity=Severity.caution,
                name="extreme_values",
                description="variables with extreme values",
            )
            issue.objects = objs
            self.issues.append(issue)

    def _add_variables_near_bounds(self):
        c = self._config
        # get ComponentSet of variables near their bounds
        cs = ims.variables_near_bounds_set(
            self._block,
            abs_tol=c.variable_bounds_absolute_tolerance,
            rel_tol=c.variable_bounds_relative_tolerance,
        )
        if len(cs) == 0:
            return
        issue = ModelIssue(
            type=ModelIssueType.numerical,
            name="var_near_bounds",
            severity=Severity.caution,
            description="variables close to their bounds",
        )
        for v in cs:
            vb = ModelIssueVariableBounded(
                name=v.name,
                type=ModelObjectType.bounded_var,
                value=value(v),
                **self._bounds_kwargs(v.bounds),
            )
            issue.objects.append(vb)
        self.issues.append(issue)

    @staticmethod
    def _bounds_kwargs(bounds: Tuple[Union[None, float], Union[None, float]]) -> Dict:
        return {
            "lower": bounds[0],
            "upper": bounds[1],
            "has_lower": bounds[0] is not None,
            "has_upper": bounds[1] is not None,
        }

    def _add_inconsistent_units(self):
        cs = identify_inconsistent_units(self._block)
        if len(cs) == 0:
            return
        issue = ModelIssue(
            type=ModelIssueType.structural,
            name="inconsistent-units",
            severity=Severity.warning,
            description="components with inconsistent units",
        )
        for comp in cs:
            obj = ModelIssueComponent(name=comp.name)
            issue.objects.append(obj)
        self.issues.append(issue)

    def _add_structural_singularities(self):
        items = self._tbx.get_dulmage_mendelsohn_partition()
        if sum(map(bool, items)) == 0:
            return
        n = ("under", "over") * 2
        t = ("variable", "constraint") * 2
        for i, name, thing in zip(range(4), n, t):
            obj_set = items[i]
            if len(obj_set) == 0:
                continue
            plural = "" if len(obj_set) == 1 else "s"
            full_type = f"{name}-constrained-{thing}"
            issue = ModelIssue(
                type=ModelIssueType.structural,
                name=full_type,
                severity=Severity.warning,
                modifiers={"constrained": name, "object-type": thing},
                description=f"Structural singularity: "
                f"{name}-constrained {thing}{plural}",
            )
            for obj in obj_set:
                obj_list = []
                if thing == "variable":
                    if hasattr(thing, "value"):
                        obj_list = [
                            ModelIssueVariable(
                                name=obj.name, value=obj.value, fixed=obj.fixed
                            )
                        ]
                    else:
                        obj_list = [
                            ModelIssueVariable(
                                name=o.name, value=o.value, fixed=o.fixed
                            )
                            for o in obj
                        ]
                elif thing == "constraint":
                    if hasattr(thing, "body"):
                        obj_list = [ModelIssueConstraint(name=obj.name, body=obj.body)]
                    else:
                        obj_list = [
                            ModelIssueConstraint(
                                name=f"{o.name}[{i}]", body=str(o.body)
                            )
                            for i, o in enumerate(obj)
                        ]
                issue.objects.extend(obj_list)

            self.issues.append(issue)

    def _add_not_in_act_constr(self):
        unused = imd.variables_not_in_activated_constraints_set(self._block)
        if not unused:
            return
        issue = ModelIssue(
            type=ModelIssueType.structural,
            severity=Severity.warning,
            name="var-not-in-act-constr",
            description="variables not in active constraints",
        )
        for v in unused:
            obj = ModelIssueVariable(name=v.name, value=v.value, fixed=v.fixed)
            issue.objects.append(obj)
        self.issues.append(issue)
