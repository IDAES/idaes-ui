"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

from pydantic import BaseModel, Field

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd
from idaes.core import FlowsheetBlock
from pyomo.environ import Component


class ModelStatistics(BaseModel):
    # variables
    dof: int = Field(default=0, alias="Degrees of Freedom")
    num_var: int = Field(default=0, alias="Total No. of Variables")
    num_var_fixed: int = Field(default=0, alias="No. Fixed Variables")
    num_var_unused: int = Field(default=0, alias="No. Unused Variables")
    num_var_fixed_unused: int = Field(default=0, alias="No. Unused Variables (Fixed)")
    num_var_ineq: int = Field(default=0, alias="No. Variables only in Inequalities")
    num_var_fixed_ineq: int = Field(default=0,
                                    alias="No. Variables only in Inequalities (Fixed)")
    # constraints/objectives
    num_constr: int = Field(default=0, alias="Total No. Constraints")
    num_constr_eq: int = Field(default=0, alias="No. Equality Constraints")
    num_constr_deact_eq: int = Field(default=0,
                                     alias="No. Equality Constraints (Deactivated)")
    num_constr_ineq: int = Field(default=0, alias="No. Inequality Constraints")
    num_constr_deact_ineq: int = Field(default=0,
                                       alias="No. Inequality Constraints (Deactivated)")
    num_obj: int = Field(default=0, alias="No. Objectives")
    num_obj_deact: int = Field(default=0, alias="No. Objectives (Deactivated)")
    # blocks
    num_block: int = Field(default=0, alias="No. Blocks")
    num_block_deact: int = Field(default=0, alias="No. Blocks (Deactivated)")
    # expressions
    num_expr: int = Field(default=0, alias="No. Expressions")

    def __init__(self, block: FlowsheetBlock = None):
        """Create new model.

        Parameters:
             block: If given, pass to `update()` to set initial values.
        """
        BaseModel.__init__(self)
        if block:
            self.update(block)

    def update(self, block: FlowsheetBlock):
        """Update values in report from the input block.

        Parameters:
            block: Block to analyze
        """
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


class ModelDiagnostics(BaseModel):
    comp_out_of_range: list[Component] = Field(dafault=None,
                                               alias="Comp. outside range")

    def update(self, block: FlowsheetBlock):
        """Update values from the input block.
        """
        self.comp_out_of_range = imd.list_components_with_values_outside_valid_range(
            block)