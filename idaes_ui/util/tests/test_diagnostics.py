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


def test_empty_diagnostics():
    d = ModelDiagnostics()
    assert d.comp_out_of_range == []
    assert "outside range" in d.get_display_name("comp_out_of_range")


@pytest.mark.unit
def test_flash_stats():
    stats = ModelStatistics(block=flash_flowsheet())
    # make sure num vars is within order of magnitude
    assert 10 < stats.num_var < 100


@pytest.mark.unit
def test_flash_diagnostics():
    with pytest.raises(DiagnosticsUpdateError):
        d = ModelDiagnostics("foo")

    d = ModelDiagnostics(block=flash_flowsheet())


@pytest.mark.unit
def test_empty_info():
    i = ModelInfo(statistics=ModelStatistics(),
                  diagnostics=ModelDiagnostics())
    assert i.statistics.dof == 0
    assert i.diagnostics.comp_out_of_range == []
    print(f"@@ INFO::{i.model_dump_json()}")