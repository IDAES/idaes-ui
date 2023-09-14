"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

import re

from pydantic import BaseModel

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd
from idaes.core.util.scaling import get_jacobian, jacobian_cond

# Import other needed IDAES types
from idaes.core import FlowsheetBlock
from pyomo.environ import Component
from pyomo.core.base.block import _BlockData


# model_statistics module
# -----------------------


class StatisticsUpdateError(Exception):
    def __init__(self, details=None):
        msg = f"Statistics update failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


# List of (attribute-name, display-name) for model statistics
statistics_index = (
    ("dof", "Degrees of Freedom"),
    ("num_var", "Total No. of Variables"),
    ("num_var_fixed", "No. Fixed Variables"),
    ("num_var_unused", "No. Unused Variables"),
    ("num_var_fixed_unused", "No. Unused Variables (Fixed)"),
    ("num_var_ineq", "No. Variables only in Inequalities"),
    ("num_var_fixed_ineq", "No. Variables only in Inequalities (Fixed)"),
    ("num_constr", "Total No. Constraints"),
    ("num_constr_eq", "No. Equality Constraints"),
    ("num_constr_deact_eq", "No. Equality Constraints (Deactivated)"),
    ("num_obj", "No. Objectives"),
    ("num_obj_deact", "No. Objectives (Deactivated)"),
    ("num_block", "No. Blocks"),
    ("num_block_deact", "No. Blocks (Deactivated)"),
    ("num_expr", "No. Expressions"),
)


class ModelStatistics(BaseModel):
    """Interface to the IDAES `model_statistics` module.
    """
    # variables
    dof: int = 0  # degrees of freedom
    num_var: int = 0
    num_var_fixed: int = 0
    num_var_unused: int = 0
    num_var_fixed_unused: int = 0
    num_var_ineq: int = 0
    num_var_fixed_ineq: int = 0
    # constraints/objectives
    num_constr: int = 0
    num_constr_eq: int = 0
    num_constr_deact_eq: int = 0
    num_constr_ineq: int = 0
    num_constr_deact_ineq: int = 0
    num_obj: int = 0
    num_obj_deact: int = 0
    # blocks
    num_block: int = 0
    num_block_deact: int = 0
    # expressions
    num_expr: int = 0

    def __init__(self, block: _BlockData):
        super().__init__()
        self._block = block
        self.update()

    def update(self):
        """Update values in report.
        """
        b = self._block
        try:
            # variables
            self.dof = ims.degrees_of_freedom(b)
            self.num_var = ims.number_variables(b)
            self.num_var_fixed = ims.number_fixed_variables(b)
            self.num_var_unused = ims.number_unused_variables(b)
            self.num_var_fixed_unused = ims.number_fixed_unused_variables(b)
            self.num_var_ineq = ims.number_variables_only_in_inequalities(b)
            self.num_var_fixed_ineq = ims.number_fixed_variables_only_in_inequalities(b)
            # constraints / objectives
            self.num_constr = ims.number_total_constraints(b)
            self.num_constr_ineq = ims.number_total_equalities(b)
            self.num_constr_deact_eq = ims.number_deactivated_equalities(b)
            self.num_constr_ineq = ims.number_total_inequalities(b)
            self.num_constr_deact_ineq = ims.number_deactivated_inequalities(b)
            self.num_obj = ims.number_total_objectives(b)
            self.num_obj_deact = ims.number_deactivated_objectives(b)
            # blocks
            self.num_block = ims.number_total_blocks(b)
            self.num_block_deact = ims.number_deactivated_blocks(b)
            # expressions
            self.num_expr = ims.number_expressions(b)
        except Exception as e:
            raise StatisticsUpdateError()


# model_diagnostics module
# ------------------------

# List of (attribute-name, display-name, description) for diagnostics
diagnostics_index = (
    ("structural_issues", "Structural issues",
     "List of structural issues with model"),
    ("numerical_issues", "Numerical issues",
     "List of numerical issues with model"),
)


class DiagnosticsError(Exception):
    def __init__(self, name, details=None):
        msg = f"Diagnostic '{name}' failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


class StructuralIssues(BaseModel):
    """Structural issues with a model.
    """
    warnings: list[str]
    cautions: list[str]
    next_steps: list[str]


class NumericalIssues(BaseModel):
    warnings: list[str]
    cautions: list[str]
    next_steps: list[str]
    jacobian_cond: float

class ModelDiagnosticsRunner:
    """Interface to the IDAES `model_diagnostics` module.
    """
    def __init__(self, block: _BlockData, **kwargs):
        self.block = block
        self.tb = imd.DiagnosticsToolbox(block, **kwargs)

    _warnings_expr = re.compile(r"WARNING:\s+(.*)")
    _cautions_expr = re.compile(r"Caution:\s+(.*)")

    def _clean_messages(self, warnings, cautions):
        cleaned_warnings = []
        for item in warnings:
            m = self._warnings_expr.match(item)
            cleaned_warnings.append(m.group(1) if m else item)
        cleaned_cautions = []
        for item in cautions:
            m = self._cautions_expr.match(item)
            cleaned_cautions.append(m.group(1) if m else item)
        return cleaned_warnings, cleaned_cautions

    @property
    def structural_issues(self) -> StructuralIssues:
        """Compute and return structural issues with the model.
        """
        try:
            warnings, next_steps = self.tb._collect_structural_warnings()
            cautions = self.tb._collect_structural_cautions()
        except Exception as e:
            raise DiagnosticsError("structural_issues",
                                   details=f"while getting warnings and cautions: {e}")
        warnings, cautions = self._clean_messages(warnings, cautions)
        return StructuralIssues(warnings=warnings, cautions=cautions,
                                next_steps=next_steps)

    @property
    def numerical_issues(self) -> NumericalIssues:
        """Compute and return numerical issues with the model.
        """
        try:
            jac, nlp = get_jacobian(self.block, scaled=False)
        except Exception as e:
            raise DiagnosticsError("numerical_issues",
                                   details=f"from get_jacobian(): {e}")
        try:
            warnings, next_steps = self.tb._collect_numerical_warnings(jac=jac, nlp=nlp)
            cautions = self.tb._collect_numerical_cautions(jac=jac, nlp=nlp)
        except Exception as e:
            raise DiagnosticsError("numerical_issues",
                                   details=f"while getting warnings and cautions: {e}")
        warnings, cautions = self._clean_messages(warnings, cautions)
        return NumericalIssues(warnings=warnings, cautions=cautions,
                                next_steps=next_steps,
                               jacobian_cond=jacobian_cond(jac=jac, scaled=False))

