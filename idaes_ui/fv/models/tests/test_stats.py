"""
Tests for the IDAES model statistics models
"""

import pytest
from . import flowsheet
from ..stats import *


@pytest.mark.unit
def test_exc():
    try:
        raise StatisticsUpdateException(details="hello")
    except DiagnosticsException as exc:
        assert "stat" in exc.name
        assert exc.details == "hello"


@pytest.mark.unit
def test_model_stats(flowsheet):
    s = ModelStats(flowsheet)
    s.update()
    print(s.as_table())
    assert s.dof.value == 13
    assert s.var.value > 100
    assert s.constr.value > 100
