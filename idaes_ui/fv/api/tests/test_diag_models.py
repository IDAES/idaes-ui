"""
Tests for the diagnostics wrapper
"""
import pytest
from idaes_ui.fv.api.diag_models import ModelStats, ModelIssues
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


@pytest.mark.unit
def test_issues_singularity(flowsheet):
    flowsheet.F03.heat_duty.unfix()  # force some uc variables / oc constraints
    iss = ModelIssues(block=flowsheet)
    iss.update()
    print(f"\nISSUES: {iss.model_dump_json()}\n")
    assert len(iss.issues) > 0
