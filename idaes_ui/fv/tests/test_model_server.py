#################################################################################
# The Institute for the Design of Advanced Energy Systems Integrated Platform
# Framework (IDAES IP) was produced under the DOE Institute for the
# Design of Advanced Energy Systems (IDAES).
#
# Copyright (c) 2018-2023 by the software owners: The Regents of the
# University of California, through Lawrence Berkeley National Laboratory,
# National Technology & Engineering Solutions of Sandia, LLC, Carnegie Mellon
# University, West Virginia University Research Corporation, et al.
# All rights reserved.  Please see the files COPYRIGHT.md and LICENSE.md
# for full copyright and license information.
#################################################################################
"""
Tests for model_server module
"""
# stdlib
# ext
import pytest
from pyomo.environ import ConcreteModel

# pkg
from idaes_ui.fv import model_server, errors, persist
from idaes.core import FlowsheetBlock
from idaes.models.properties.activity_coeff_models.BTX_activity_coeff_VLE import (
    BTXParameterBlock,
)
from idaes.models.unit_models import Flash
from .test_fsvis import flash_model

@pytest.mark.unit
def test_flowsheet_server_class():
    srv = model_server.FlowsheetServer()
    assert srv.port is not None


@pytest.mark.unit
def test_save_flowsheet(flash_model):
    srv = model_server.FlowsheetServer()
    with pytest.raises(errors.ProcessingError):
        srv.save_flowsheet("oscar", {})
    fs = flash_model.fs
    srv.add_flowsheet("oscar", fs, persist.MemoryDataStore())
    with pytest.raises(errors.ProcessingError):
        srv.save_flowsheet("oscar", {"invalid": pytest})


@pytest.mark.unit
def test_update_flowsheet(flash_model):
    srv = model_server.FlowsheetServer()
    with pytest.raises(errors.FlowsheetUnknown):
        srv.update_flowsheet("oscar")
    # add a flowsheet,
    fs = flash_model.fs
    srv.add_flowsheet("oscar", fs, persist.MemoryDataStore())
    # Put in a bad value, DEPENDS ON PROTECTED ATTR
    srv._flowsheets["oscar"] = None
    with pytest.raises(errors.ProcessingError):
        srv.update_flowsheet("oscar")
    # Delete it, DEPENDS ON PROTECTED ATTR
    del srv._flowsheets["oscar"]
    # Update should fail not-found
    with pytest.raises(errors.FlowsheetNotFoundInMemory):
        srv.update_flowsheet("oscar")


@pytest.mark.integration
def test_flowsheet_server_run(flash_model):
    import requests

    srv = model_server.FlowsheetServer()
    srv.start()
    srv.path = "/app"
    resp = requests.get(f"http://localhost:{srv.port}/app")
    assert not resp.ok
    # ok to get /app with bogus id (id is just added to response page)
    resp = requests.get(f"http://localhost:{srv.port}/app?id=1234")
    assert resp.ok
    # not ok to get /fs with bogus id
    resp = requests.get(f"http://localhost:{srv.port}/fs?id=1234")
    assert not resp.ok
    # add the flowsheet
    fs = flash_model.fs
    srv.add_flowsheet("oscar", fs, persist.MemoryDataStore())
    # now /fs should work
    resp = requests.get(f"http://localhost:{srv.port}/fs?id=oscar")
    assert resp.ok
    print("Bogus PUT")
    resp = requests.put(f"http://localhost:{srv.port}/fs")
    assert not resp.ok
    resp = requests.put(f"http://localhost:{srv.port}/fs?id=bogus_id")
    assert not resp.ok
    # test getting setting values
    resp = requests.get(f"http://localhost:{srv.port}/setting")
    assert not resp.ok
    resp = requests.get(f"http://localhost:{srv.port}/setting?bogus_key=1234")
    assert not resp.ok
    resp = requests.get(
        f"http://localhost:{srv.port}/setting?setting_key=save_time_interval"
    )
    assert resp.ok
    assert resp.json()["setting_value"] == None
    srv.add_setting("dummy_setting", 5000)
    resp = requests.get(
        f"http://localhost:{srv.port}/setting?setting_key=dummy_setting"
    )
    assert resp.ok
    assert resp.json()["setting_value"] == 5000
