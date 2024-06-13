"""
Data model for combined IDAES model diagnostic data
"""
__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# external packages
from pydantic import BaseModel, computed_field

# IDAES/Pyomo
from pyomo.core.base.block import _BlockData
from idaes.core.util import model_diagnostics as imd

# package
from .stats import ModelStats
from .issues import ModelIssues
from .diagnostics_toolbox_report import (
    DiagnosticsToolBoxReport,
    DiagnosticsToolBoxReportData,
)

# Data model


class DiagnosticsData(BaseModel):
    """The standard set of diagnostics data for a flowsheet"""

    config: dict = dict(imd.CONFIG)
    diagnostics_toolbox_report: DiagnosticsToolBoxReportData = {}

    def __init__(self, block: _BlockData, **kwargs):
        super().__init__(**kwargs)
        self._ms = ModelStats(block)
        self._mi = ModelIssues(block)
        self.diagnostics_toolbox_report = DiagnosticsToolBoxReport(block=block)

    @computed_field
    @property
    def statistics(self) -> ModelStats:
        return self._ms

    @computed_field
    @property
    def issues(self) -> ModelIssues:
        self._mi.update()
        return self._mi
