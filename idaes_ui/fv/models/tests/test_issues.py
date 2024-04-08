"""
Tests for issues module
"""

import pytest
from ..issues import *
from . import flowsheet


@pytest.mark.unit
def test_exc():
    try:
        raise DiagnosticsException(name="foo", details="hello")
    except DiagnosticsException as err:
        assert err.name == "foo"
        assert err.details == "hello"


@pytest.mark.unit
def test_issues(flowsheet):
    iss = ModelIssues(block=flowsheet)
    iss.update()
    assert len(iss.issues) > 0


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
    assert len(iss.issues) > 0
