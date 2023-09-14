"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.util.diagnostics import ModelStatistics, ModelDiagnosticsRunner
from idaes_ui.fv.tests.flowsheets import flash_flowsheet, demo_flowsheet


@pytest.mark.unit
def test_flash_stats():
    stats = ModelStatistics(block=flash_flowsheet())
    # check that num vars is right order of magnitude
    assert 10 < stats.num_var < 100


@pytest.mark.unit
def test_structural():
    diag = ModelDiagnosticsRunner(block=flash_flowsheet())
    data = diag.structural_issues
    print(f"structural json: {data.model_dump_json()}")
    assert len(data.warnings) == 0


@pytest.mark.unit
def test_numerical():
    diag = ModelDiagnosticsRunner(block=demo_flowsheet())
    data = diag.numerical_issues
    print(f"numerical json: {data.model_dump_json()}")
    #assert len(data.warnings) == 0
