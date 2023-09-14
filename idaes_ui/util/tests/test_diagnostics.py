"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.util.diagnostics import ModelStatistics, ModelDiagnostics, ModelInfo
from idaes_ui.util.diagnostics import StatisticsUpdateError, DiagnosticsUpdateError
from idaes_ui.fv.tests.flowsheets import flash_flowsheet


@pytest.mark.unit
def test_empty_stats():
    r = ModelStatistics()
    assert r.dof == 0
    assert r.get_display_name("dof") == "Degrees of Freedom"


@pytest.mark.unit
def test_flash_stats():
    stats = ModelStatistics(block=flash_flowsheet())
    # make sure num vars is within order of magnitude
    assert 10 < stats.num_var < 100


@pytest.mark.unit
def test_structural():
    diag = ModelDiagnostics(block=flash_flowsheet())
    data = diag.structural_issues
    assert len(data.warnings) == 0