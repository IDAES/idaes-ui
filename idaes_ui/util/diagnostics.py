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

# Exceptions
# ----------


class UpdateError(Exception):
    def __init__(self, what, details=None):
        msg = f"{what} update failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


class StatisticsUpdateError(UpdateError):
    def __init__(self, **kwargs):
        super().__init__("Statistics", **kwargs)


class DiagnosticsUpdateError(UpdateError):
    def __init__(self, **kwargs):
        super().__init__("Diagnostics", **kwargs)

# Constants
# ---------


META_NAME_SECTION = "names"
META_DESC_SECTION = "descriptions"


# Functions / Classes
# -------------------

class ModelBlock(BaseModel, ABC):
    def __init__(self, block: FlowsheetBlock = None):
        """Create new model.

        Parameters:
             block: If given, pass to `update()` to set initial values.
        """
        super().__init__()
        if block:
            self.update(block)

    @abstractmethod
    def update(self, block: FlowsheetBlock):
        pass


class HasMetadata(BaseModel):
    """Provide an interface to metadata for attributes.
    """
    meta_: dict = Field(default={META_NAME_SECTION: {}, META_DESC_SECTION: {}})

    def get_display_name(self, attr) -> Union[str, None]:
        """Get display name for given attribute.

        Args:
            attr: Name of attribute (should match name in class)

        Returns:
            name or None if no name was provided in the metadata
        """
        return self._get_meta(META_NAME_SECTION, attr, None)

    def get_desc(self, attr) -> str:
        """Get description for given attribute.

        Args:
            attr: Name of attribute (should match name in class)

        Returns:
            description or empty string if none was provided in the metadata
        #"""
        return self._get_meta(META_DESC_SECTION, attr, "")

    def _get_meta(self, section, attr, empty):
        if attr not in self.meta_[section]:
            return empty
        return self.meta_[section][attr]

    def set_names(self, items: Sequence[Tuple[str, str]]):
        for key, value in items:
            self.meta_[META_NAME_SECTION][key] = value

    def set_descriptions(self, items: Sequence[Tuple[str, str]]):
        for key, value in items:
            self.meta_[META_DESC_SECTION][key] = value


class ModelStatistics(ModelBlock, HasMetadata):
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

    def __init__(self, block: FlowsheetBlock = None):
        """Create new model.

        Parameters:
             block: If given, pass to `update()` to set initial values.
        """
        super().__init__(block)
        self.set_names((
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
        ))

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


class ModelDiagnostics(ModelBlock, HasMetadata):
    """Interface to the IDAES `model_diagnostics` module.
    """
    comp_out_of_range: list[Component] = []
    model_config = ConfigDict(arbitrary_types_allowed=True)

    def __init__(self, block: FlowsheetBlock = None):
        super().__init__(block)
        self.set_names((
            ("comp_out_of_range", "Comp. outside range"),
        ))
        self.set_descriptions((
            ("comp_out_of_range", "Components outside of valid range"),
        ))

    def update(self, block: FlowsheetBlock):
        """Update values from the input block."""
        try:
            self.comp_out_of_range = imd.list_components_with_values_outside_valid_range(
                block
            )
        except Exception as e:
            raise DiagnosticsUpdateError()


class ModelInfo(BaseModel):
    """Combined model statistics and diagnostics
    """
    statistics: ModelStatistics
    diagnostics: ModelDiagnostics
