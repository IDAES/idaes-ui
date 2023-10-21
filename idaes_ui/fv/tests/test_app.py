"""
Tests for the IDAES FV app, using FastAPI TestClient
"""
import pytest
from fastapi.testclient import TestClient
from ..app import FlowsheetApp
from . import flowsheet


@pytest.fixture
def fvapp(flowsheet):
    """Start the FastAPI app."""
    return FlowsheetApp(flowsheet).app


@pytest.fixture
def client(fvapp):
    """FastAPI client for testing"""
    return TestClient(fvapp)


@pytest.mark.unit
def test_diag_smoke(client):
    response = client.get("/diagnostics/")
    assert response.status_code == 200


@pytest.mark.unit
def test_diag(client):
    response = client.get("/diagnostics/")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"config", "issues", "statistics"}
