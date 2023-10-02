"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.util.diagnostics import ModelStats, ModelIssues
from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet


@pytest.fixture
def flowsheet():
    return idaes_demo_flowsheet()


@pytest.mark.unit
def test_stats(flowsheet):
    stats = ModelStats(block=flowsheet)
    assert stats.var.value > 100


@pytest.mark.unit
def test_issues(flowsheet):
    iss = ModelIssues(block=flowsheet)
    iss.update()
    assert len(iss.issues) > 0

