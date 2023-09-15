"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.util.diagnostics import ModelStatistics, ModelDiagnosticsRunner
from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet


@pytest.fixture
def flowsheet():
    return idaes_demo_flowsheet()


@pytest.mark.unit
def test_flash_stats(flowsheet):
    stats = ModelStatistics(block=flowsheet)
    assert stats.num_var > 100


@pytest.mark.unit
def test_structural(flowsheet):
    diag = ModelDiagnosticsRunner(block=flowsheet)
    data = diag.structural_issues
    print(f"structural json: {data.model_dump_json()}")
    assert len(data.warnings) == 0


@pytest.mark.unit
def test_numerical(flowsheet):
    flowsheet.solve()
    diag = ModelDiagnosticsRunner(block=flowsheet)
    data = diag.numerical_issues
    print(f"numerical json: {data.model_dump_json()}")
    #assert len(data.warnings) == 0
