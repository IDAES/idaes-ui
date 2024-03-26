"""
Tests for the diagnostics models
"""
import pytest
from ..diag import DiagnosticsData
from . import flowsheet


@pytest.mark.unit
def test_data(flowsheet):
    data = DiagnosticsData(flowsheet)
    # print(data.model_dump_json())  # forces update
