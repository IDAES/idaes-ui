"""
Data model for IDAES model statistics
"""
__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
from typing import Dict, Union, List, Tuple
# external packages
from pandas import DataFrame
from pydantic import BaseModel
# IDAES / pyomo
from idaes.core.util import model_statistics as ims
from pyomo.core.base.block import _BlockData
# package
from .base import DiagnosticsException


class StatisticsUpdateException(DiagnosticsException):
    """Error updating the statistics."""

    def __init__(self, details=None):
        super().__init__("statistics update", details=details)


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
        except Exception as err:
            raise StatisticsUpdateException(details=str(err))

    def as_table(self) -> DataFrame:
        """Transform model information into a table.

        Returns:
            DataFrame: Pandas DataFrame with the following columns:

                1. type = Main type, e.g. 'var' for variables
                2. subtypes = Comma-separated list of subtypes, e.g. 'fixed,unused'.
                   If empty, this is the total for the type.
                3. attr = For convenience, the type + subtypes as a dot-separated
                   attribute. Simply add ".value" to fetch value
                4. value = Count for this combination of type and subtype(s)
        """
        a = []
        for type_, info in self.model_dump().items():
            for subtypes, val in self._as_table_subtypes(info, ()):
                attr_name = ".".join([type_] + list(subtypes))
                a.append((type_, ",".join(subtypes), attr_name, val))
        return DataFrame(data=a, columns=["type", "subtypes", "attr", "value"])

    @classmethod
    def _as_table_subtypes(
        cls, info: Dict[str, Union[Dict, float]], subtypes: Union[Tuple[str], Tuple]
    ) -> List[Tuple[Tuple[str], float]]:
        result = []
        for key in info:
            if key == "value":
                result.append((subtypes, info[key]))
            else:
                nested_types = tuple(list(subtypes) + [key])  # for type-checker
                nested_result = cls._as_table_subtypes(info[key], nested_types)
                result.extend(nested_result)
        return result
