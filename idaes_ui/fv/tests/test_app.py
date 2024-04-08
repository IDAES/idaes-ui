"""
Tests for the IDAES FV app, using FastAPI TestClient
"""

import pytest

pytest.importorskip("fastapi", reason="fastapi not available")
from fastapi.testclient import TestClient
from ..app import FlowsheetApp
from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet

# fixtures


@pytest.fixture(scope="module")  # build flowsheet only once
def fvapp():
    """Start the FastAPI app."""
    flowsheet = idaes_demo_flowsheet()
    return FlowsheetApp(flowsheet).app


@pytest.fixture
def client(fvapp):
    """FastAPI client for testing"""
    return TestClient(fvapp)


# Tests.
# Unit test naming:
#   test_{route} => smoke test for http status for all operations
#   test_{get/put/..}_{route} => test data


@pytest.mark.unit
def test_diagnostics(client):
    response = client.get("/diagnostics/")
    assert response.status_code == 200


@pytest.mark.unit
def test_get_diagnostics(client):
    response = client.get("/diagnostics/")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"config", "issues", "statistics"}


@pytest.mark.unit
def test_settings(client):
    response = client.get("/settings/")
    assert response.status_code == 200
    response = client.put("/settings/", json=response.json())
    assert response.status_code == 200


@pytest.mark.unit
def test_get_settings(client):
    response = client.get("/settings/")
    assert response.status_code == 200
    data = response.json()
    assert len(data.keys()) > 0


@pytest.mark.unit
def test_put_settings(client):
    response = client.get("/settings/")
    data1 = response.json()
    data1["autosave_interval"] += 1
    response = client.put("/settings/", json=data1)
    response = client.get("/settings/")
    data2 = response.json()
    assert data1 == data2


@pytest.mark.unit
def test_fs(client):
    response = client.get("/fs/")
    assert response.status_code == 200
    response = client.put("/fs/", json=response.json())
    assert response.status_code == 200


@pytest.mark.unit
def test_get_fs(client):
    response = client.get("/fs/")
    assert response.status_code == 200
    data = response.json()
    print(data)
    keys = set(data.keys())
    assert {"name", "model", "cells"}.issubset(keys)


@pytest.mark.unit
def test_put_fs(client):
    response = client.get("/fs/")
    assert response.status_code == 200
    data1 = response.json()
    # modify position of 1st 'cell'
    cells = data1["cells"]
    cells[0]["position"]["x"] += 1
    # check that modification survived
    response = client.put("/fs/", json=data1)
    data2 = response.json()
    assert data1 == data2
