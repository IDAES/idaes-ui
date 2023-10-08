"""
Tests for the diagnostics models
"""
import pytest
from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet
from ..diag import DiagnosticsData


@pytest.fixture
def flowsheet():
    return idaes_demo_flowsheet()


@pytest.mark.unit
def test_data(flowsheet):
    data = DiagnosticsData(flowsheet)
    print(data.model_dump_json())  # forces update
