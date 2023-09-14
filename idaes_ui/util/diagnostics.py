"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

from abc import ABC, abstractmethod
from typing import Union, Sequence, Tuple

from pydantic import BaseModel, Field, ConfigDict

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd
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

    def update(self, block: FlowsheetBlock):
        """Update values in report from the input block.

        Parameters:
            block: Block to analyze
        """
        try:
            # variables
            self.dof = ims.degrees_of_freedom(block)
            self.num_var = ims.number_variables(block)
            self.num_var_fixed = ims.number_fixed_variables(block)
            self.num_var_unused = ims.number_unused_variables(block)
            self.num_var_fixed_unused = ims.number_fixed_unused_variables(block)
            self.num_var_ineq = ims.number_variables_only_in_inequalities(block)
            self.num_var_fixed_ineq = ims.number_fixed_variables_only_in_inequalities(block)
            # constraints / objectives
            self.num_constr = ims.number_total_constraints(block)
            self.num_constr_ineq = ims.number_total_equalities(block)
            self.num_constr_deact_eq = ims.number_deactivated_equalities(block)
            self.num_constr_ineq = ims.number_total_inequalities(block)
            self.num_constr_deact_ineq = ims.number_deactivated_inequalities(block)
            self.num_obj = ims.number_total_objectives(block)
            self.num_obj_deact = ims.number_deactivated_objectives(block)
            # blocks
            self.num_block = ims.number_total_blocks(block)
            self.num_block_deact = ims.number_deactivated_blocks(block)
            # expressions
            self.num_expr = ims.number_expressions(block)
        except Exception as e:
            raise StatisticsUpdateError()


# model_diagnostics module
# ------------------------

# List of (attribute-name, display-name, description) for diagnostics
diagnostics_index = (
    ("structural_issues", "Structural issues",
     "List of structural issues with model"),
#    ("comp_out_of_range", "Comp. outside range",
#     "List of model components outside of valid range"),
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


class ModelDiagnostics:
    """Interface to the IDAES `model_diagnostics` module.
    """
    def __init__(self, block: _BlockData, **kwargs):
        self.block = block
        self.tb = imd.DiagnosticsToolbox(block, **kwargs)

    @property
    def structural_issues(self) -> StructuralIssues:
        warnings, next_steps = self.tb._collect_structural_warnings()
        cautions = self.tb._collect_structural_cautions()
        return StructuralIssues(warnings=warnings, cautions=cautions,
                                next_steps=next_steps)

    # def comp_out_of_range(self):
    #     comp_list = imd.list_components_with_values_outside_valid_range(
    #         self.block
    #     )
    #     return [] # XXX: Serialize

