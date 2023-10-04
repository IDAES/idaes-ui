"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

# stdlib
import argparse
from enum import Enum
import json
import sys
from typing import Dict, Union, List, Tuple

# third-party
from pydantic import BaseModel, computed_field
from pandas import DataFrame

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd
from idaes.core.util.scaling import get_jacobian, jacobian_cond

# Import other needed IDAES types
from pyomo.core.base.block import _BlockData
from pyomo.environ import value
from pyomo.util.check_units import identify_inconsistent_units


# Wrap model_statistics module
# ============================


class StatisticsUpdateError(Exception):
    def __init__(self, details=None):
        msg = f"Statistics update failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


# Pydantic model for statistics
# -----------------------------


class StatsCount(BaseModel):
    # Value
    value: int = 0


class StatsCountDeactType(StatsCount):
    deact: StatsCount = StatsCount()


class StatsCountVarFixed(StatsCount):
    unused: StatsCount = StatsCount()


class StatsCountVarIneq(StatsCount):
    fixed: StatsCount = StatsCount()


class StatsCountConstraints(StatsCount):
    eq: StatsCountDeactType = StatsCountDeactType()
    ineq: StatsCountDeactType = StatsCountDeactType()


class StatsCountVar(StatsCount):
    unused: StatsCount = StatsCount()
    fixed: StatsCountVarFixed = StatsCountVarFixed()
    ineq: StatsCountVarIneq = StatsCountVarIneq()


class ModelStats(BaseModel):
    """Model Statistics API

    For each named item (or sub item), access the value as ".value"::

        m = ModelStats()
        m.dof.value = 3
        m.var.fixed.ineq.value = 5
    """

    dof: StatsCount = StatsCount()
    var: StatsCountVar = StatsCountVar()
    ineq: StatsCount = StatsCount()
    constr: StatsCountConstraints = StatsCountConstraints()
    obj: StatsCountDeactType = StatsCountDeactType()
    block: StatsCountDeactType = StatsCountDeactType()
    expr: StatsCount = StatsCount()

    def __init__(self, block: _BlockData):
        super().__init__()
        self._block = block
        self.update()

    def update(self):
        """Update values in report."""
        b = self._block
        try:
            # variables
            self.dof.value = ims.degrees_of_freedom(b)
            self.var.value = ims.number_variables(b)
            self.var.fixed.value = ims.number_fixed_variables(b)
            self.var.unused.value = ims.number_unused_variables(b)
            self.var.fixed.unused.value = ims.number_fixed_unused_variables(b)
            self.var.ineq.value = ims.number_variables_only_in_inequalities(b)
            self.var.ineq.fixed.value = ims.number_fixed_variables_only_in_inequalities(
                b
            )
            # constraints / objectives
            self.constr.value = ims.number_total_constraints(b)
            self.constr.eq.value = ims.number_total_equalities(b)
            self.constr.eq.deact.value = ims.number_deactivated_equalities(b)
            self.constr.ineq.value = ims.number_total_inequalities(b)
            self.constr.ineq.deact.value = ims.number_deactivated_inequalities(b)
            self.obj.value = ims.number_total_objectives(b)
            self.obj.deact.value = ims.number_deactivated_objectives(b)
            # blocks
            self.block.value = ims.number_total_blocks(b)
            self.block.deact.value = ims.number_deactivated_blocks(b)
            # expressions
            self.expr.value = ims.number_expressions(b)
        except Exception as e:
            raise StatisticsUpdateError()

    def as_table(self) -> DataFrame:
        """Transform model information into a table.

        Returns:
            DataFrame: Pandas DataFrame with the following columns:

                1. type = Main type, e.g. 'var' for variables
                2. subtypes = Comma-separated list of subtypes, e.g. 'fixed,unused'.
                   If empty, this is the total for the type.
                3. attr = For convenience, the type + subtypes as a dot-separated attribute.
                   Simply add ".value" to fetch value
                4. value = Count for this combination of type and subtype(s)
        """
        a = []
        for type_, info in self.model_dump().items():
            for subtypes, val in self._as_table_subtypes(info, ()):
                attr_name = ".".join([type_] + list(subtypes))
                a.append((type_, ",".join(subtypes), attr_name, val))
        return DataFrame(data=a, columns=("type", "subtypes", "attr", "value"))

    @classmethod
    def _as_table_subtypes(cls, info, subtypes) -> Tuple[Tuple[str], float]:
        result = []
        for key in info:
            if key == "value":
                result.append((subtypes, info[key]))
            else:
                result.extend(cls._as_table_subtypes(info[key], subtypes + (key,)))
        return result


# Wrap model_diagnostics module
# =============================


class DiagnosticsError(Exception):
    def __init__(self, name, details=None):
        msg = f"Diagnostic '{name}' failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


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
    value: float = 0.0
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
    name: str = ""
    description: str = ""
    objects: List[
        Union[ModelIssueVariable, ModelIssueVariableBounded, ModelIssueConstraint]
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
            issue.issues.append(obj)
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
                description=f"Structural singularity: {name}-constrained {thing}{plural}",
            )
            for obj in obj_set:
                obj_list = []
                if thing == "variable":
                    if hasattr(thing, "value"):
                        obj_list = [
                            ModelIssueVariable(
                                name=f"{full_type} {obj.name}", value=obj.value, fixed=obj.fixed
                            )
                        ]
                    else:
                        obj_list = [
                            ModelIssueVariable(
                                name=f"{full_type} {o.name}", value=o.value, fixed=o.fixed
                            )
                            for o in obj
                        ]
                elif thing == "constraint":
                    if hasattr(thing, "body"):
                        obj_list = [
                            ModelIssueConstraint(name=f"{full_type}", body=obj.body)
                        ]
                    else:
                        obj_list = [
                            ModelIssueConstraint(
                                name=f"{full_type} [{i}]", body=str(o.body)
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


# class StructuralIssues_orig(BaseModel):
#     """Structural issues with a model."""
#
#     warnings: List[str]
#     cautions: List[str]
#     next_steps: List[str]
#
#
# class ModelDiagnosticsRunner:
#     """Interface to the IDAES `model_diagnostics` module."""
#
#     def __init__(self, block: _BlockData, **kwargs):
#         self.block = block
#         self.tb = imd.DiagnosticsToolbox(block, **kwargs)
#
#     _warnings_expr = re.compile(r"WARNING:\s+(.*)")
#     _cautions_expr = re.compile(r"Caution:\s+(.*)")
#
#     def _clean_messages(self, warnings, cautions):
#         """Remove useless prefixes from messages"""
#         cleaned_warnings = []
#         for item in warnings:
#             m = self._warnings_expr.match(item)
#             cleaned_warnings.append(m.group(1) if m else item)
#         cleaned_cautions = []
#         for item in cautions:
#             m = self._cautions_expr.match(item)
#             cleaned_cautions.append(m.group(1) if m else item)
#         return cleaned_warnings, cleaned_cautions
#
#     @property
#     def structural_issues(self) -> StructuralIssues:
#         """Compute and return structural issues with the model."""
#         try:
#             warnings, next_steps = self.tb._collect_structural_warnings()
#             cautions = self.tb._collect_structural_cautions()
#         except Exception as e:
#             raise DiagnosticsError(
#                 "structural_issues", details=f"while getting warnings and cautions: {e}"
#             )
#         warnings, cautions = self._clean_messages(warnings, cautions)
#         return StructuralIssues(
#             warnings=warnings, cautions=cautions, next_steps=next_steps
#         )
#
#     @property
#     def numerical_issues(self) -> NumericalIssues:
#         """Compute and return numerical issues with the model."""
#         try:
#             jac, nlp = get_jacobian(self.block, scaled=False)
#         except Exception as e:
#             raise DiagnosticsError(
#                 "numerical_issues", details=f"while getting jacobian: {e}"
#             )
#         try:
#             warnings, next_steps = self.tb._collect_numerical_warnings(jac=jac, nlp=nlp)
#             cautions = self.tb._collect_numerical_cautions(jac=jac, nlp=nlp)
#         except Exception as e:
#             raise DiagnosticsError(
#                 "numerical_issues", details=f"while getting warnings and cautions: {e}"
#             )
#         warnings, cautions = self._clean_messages(warnings, cautions)
#         return NumericalIssues(
#             warnings=warnings,
#             cautions=cautions,
#             next_steps=next_steps,
#             jacobian_cond=jacobian_cond(jac=jac, scaled=False),
#         )


class DiagnosticsData(BaseModel):
    """The standard set of diagnostics data for a flowsheet"""

    config: dict = dict(imd.CONFIG)

    def __init__(self, block: _BlockData):
        super().__init__()
        self._ms = ModelStats(block)
        self._mi = ModelIssues(block)

    @computed_field
    @property
    def statistics(self) -> ModelStats:
        return self._ms

    @computed_field
    @property
    def issues(self) -> ModelIssues:
        self._mi.update()
        return self._mi


def print_sample_output(output_file, indent=False, solve=True, schema=False):
    from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet

    flowsheet = idaes_demo_flowsheet()
    if solve:
        flowsheet.solve()
    data = DiagnosticsData(flowsheet)

    output_file.write(data.model_dump_json(indent=indent))

    if schema:
        output_file.write("\n----\n")
        json.dump(
            data.model_json_schema(mode="serialization"), output_file, indent=indent
        )


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("-f", "--file", help="Output file (default=stdout)")
    p.add_argument("-i", "--indent", help="indent JSON", action="store_true")
    p.add_argument("-n", "--no-solve", help="do not solve model", action="store_true")
    p.add_argument("-s", "--schema", help="also print JSON schema", action="store_true")
    args = p.parse_args()
    # choose output stream
    if args.file:
        try:
            ofile = open(args.file, "w")
        except IOError as e:
            print(f"Failed to open output file '{args.file}': {e}")
            sys.exit(-1)
    else:
        ofile = sys.stdout

    # create output
    print_sample_output(
        ofile, indent=args.indent, solve=not args.no_solve, schema=args.schema
    )
    if ofile is not sys.stdout:
        print(f"\nWrote output to file: {args.file}")
