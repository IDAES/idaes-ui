"""
Tests for base module
"""
import pytest
from ..base import DiagnosticsException, DiagnosticsError


@pytest.mark.unit
def test_diagnostics_exception():
    e = DiagnosticsException("foo")
    assert e.name == "foo"
    assert e.details is None

    e = DiagnosticsException("bar", details="hello")
    assert e.name == "bar"
    assert e.details == "hello"


@pytest.mark.unit
def test_diagnostics_error_from_exception():
    exc = DiagnosticsException("foo")
    err = DiagnosticsError.from_exception(exc)
    assert err.error_type == "foo"
    assert len(err.error_message) > 0
    assert err.error_details == ""
