"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.util.diagnostics import ModelStatistics
from idaes_ui.fv.tests.flowsheets import flash_flowsheet


@pytest.mark.unit
def test_create_report():
    r = ModelStatistics()
    assert r.dof == 0


@pytest.mark.unit
def test_update_report():
    stats = ModelStatistics(block=flash_flowsheet())
    print(f"report for flash flowsheet: {stats.model_dump_json(by_alias=True)}")
