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
import copy
from importlib import resources
import json
from pathlib import Path
import pytest

from idaes.models.unit_models import Heater, PressureChanger, HeatExchanger
from pyomo.environ import TransformationFactory, ConcreteModel
from idaes.core import FlowsheetBlock
from idaes.models.properties.general_helmholtz import helmholtz_available

from .shared import dict_diff

from idaes_ui.fv.flowsheet import FlowsheetSerializer, FlowsheetDiff
from idaes_ui.fv import validate_flowsheet
from idaes_ui.fv.tests import flowsheets as test_flowsheets

# === Sample data ===

test_dir = Path(__file__).parent

base_model = {
    "model": {"id": "Model1", "unit_models": {}, "arcs": {}},
    "cells": {},
    "routing_config": {},
}


@pytest.fixture
def models():
    # Build a series of models where each has one more component than
    # the last, and the arcs connect the components in a loop
    models = {}
    unit_types = "mixer", "heater", "stoichiometric_reactor"
    for n in range(1, len(unit_types) + 1):
        model = copy.deepcopy(base_model)
        m = model["model"]
        m["id"] = f"Model{n}"
        m["unit_models"] = {}
        for unit_num in range(n):
            m["unit_models"][f"U{unit_num}"] = {
                "type": unit_types[unit_num],
                "image": unit_types[unit_num] + ".svg",
            }
        m["arcs"] = {}
        if n > 1:
            for arc_num in range(n):
                unit_num = arc_num
                m["arcs"][f"A{arc_num}"] = {
                    "source": f"U{unit_num}",
                    "dest": f"U{(unit_num + 1) % n}",
                    "label": f"stream {arc_num}",
                }
        # add minimal cells for each unit model and arc
        c = model["cells"] = []
        for key, value in m["unit_models"].items():
            c.append(
                {
                    "id": key,
                    "attrs": {
                        "image": {"xlinkHref": "image.svg"},
                        "root": {"title": "TITLE"},
                    },
                }
            )
        for key, value in m["arcs"].items():
            c.append(
                {
                    "id": key,
                    "source": {"id": value["source"]},
                    "target": {"id": value["dest"]},
                    "labels": [{"attrs": {"text": {"text": "LABEL"}}}],
                }
            )
        # done
        models[n] = model
    return models


@pytest.fixture(scope="module")
def demo_flowsheet():
    return test_flowsheets.demo_flowsheet()


def _get_demo_flowsheet():
    return test_flowsheets.demo_flowsheet()


@pytest.fixture(scope="module")
def flash_flowsheet():
    return test_flowsheets.flash_flowsheet()


def _get_flash_flowsheet():
    return test_flowsheets.flash_flowsheet()


def _get_boiler_flowsheet():
    import idaes.models_extra.power_generation.flowsheets.supercritical_power_plant.boiler_subflowsheet_build as blr

    m, solver = blr.main()
    return m.fs


# === Tests ===


@pytest.mark.unit
def test_merge(models):
    """Test the FlowsheetDiff output from the .merge() function."""
    num_models = len(models)

    # With N models, in increasing complexity, test the results of merging
    # each with with the next, including the last with the first.
    for i in range(num_models):
        next_i = (i + 1) % num_models
        old, new = models[i + 1], models[next_i + 1]
        merged = FlowsheetDiff(old, new).merged(do_copy=bool(i % 2))
        assert merged["model"] == new["model"]
        sources, dests, units = [], [], []
        for item in merged["cells"]:
            id_ = item["id"]
            if "source" in item:  # arc
                sources.append(item["source"])
                dests.append(item["target"])
            else:  # unit model
                units.append(id_)
        # Each unit ID will show up exactly once in each of these sets, except
        # when we wrap around to the start where there are no arcs
        expect_unit_ids = sorted([f"U{n}" for n in range(0, next_i + 1)])
        assert expect_unit_ids == sorted(units)
        if next_i == 0:
            assert sources == []
            assert dests == []
        else:
            assert expect_unit_ids == sorted([x["id"] for x in sources])
            assert expect_unit_ids == sorted([x["id"] for x in dests])

    # Test the results of merging each with a changed version of itself
    for i in range(1, num_models + 1):
        old, new = models[i], copy.deepcopy(models[i])
        m = new["model"]
        for key in m["unit_models"]:
            m["unit_models"][key]["image"] = "changed.svg"
        for key in m["arcs"]:
            m["arcs"][key]["label"] = "changed"
        merged = FlowsheetDiff(old, new).merged()
        assert merged["model"] == new["model"]
        for cell in merged["cells"]:
            if "source" in cell:
                # see if label was copied into layout
                assert cell["labels"][0]["attrs"]["text"]["text"] == "changed"
            else:
                assert cell["attrs"]["image"]["xlinkHref"] == "changed.svg"


@pytest.mark.unit
def test_validate_flowsheet(models):
    # these have a type error since they are not iterable at all
    pytest.raises(TypeError, validate_flowsheet, None)
    pytest.raises(TypeError, validate_flowsheet, 123)
    # these are missing the top-level keys (but are sort of iterable, so no type error)
    assert validate_flowsheet("hello")[0] is False
    assert validate_flowsheet([])[0] is False
    # empty one fails
    assert validate_flowsheet({})[0] is False
    # the minimal ones we manually constructed will pass
    for model in models.values():
        assert validate_flowsheet(model)[0]
    # now try tweaks on the minimal ones
    m = models[2]["model"]
    # remove image
    image = m["unit_models"]["U1"]["image"]
    del m["unit_models"]["U1"]["image"]
    assert validate_flowsheet(m)[0] is False
    m["unit_models"]["U1"]["image"] = image  # restore it
    # mess up a unit model ID
    m["unit_models"]["U-FOO"] = m["unit_models"]["U1"]
    del m["unit_models"]["U1"]
    assert validate_flowsheet(m)[0] is False
    m["unit_models"]["U1"] = m["unit_models"]["U-FOO"]
    del m["unit_models"]["U-FOO"]
    # mess up an arc ID
    m["arcs"]["A-FOO"] = m["arcs"]["A1"]
    del m["arcs"]["A1"]
    assert validate_flowsheet(m)[0] is False
    m["arcs"]["A1"] = m["arcs"]["A-FOO"]
    del m["arcs"]["A-FOO"]


def _canonicalize(d: dict) -> dict:
    d = json.loads(json.dumps(d, sort_keys=True))
    for cell in d["cells"]:
        if "ports" in cell:
            items = cell["ports"]["items"]
            cell["ports"]["items"] = sorted(items, key=lambda x: x["id"])
        if "position" in cell:
            cell.pop("position")
    return d


@pytest.mark.parametrize(
    "id_,make_flowsheet,serialized_file_name",
    [
        ("demo", _get_demo_flowsheet, "demo_flowsheet.json"),
        ("demo", _get_flash_flowsheet, "flash_flowsheet.json"),
        #        ("boiler", _get_boiler_flowsheet, "serialized_boiler_flowsheet.json"),
    ],
    ids=lambda obj: getattr(obj, "__qualname__", str(obj)),
)
def test_flowsheet_serializer(
    id_: str, make_flowsheet: callable, serialized_file_name: str
):
    fs = make_flowsheet()
    test_dict = FlowsheetSerializer(fs, id_).as_dict()
    reference_dict = json.loads(resources.read_text(__package__, serialized_file_name))

    test_dict = _canonicalize(test_dict)
    reference_dict = _canonicalize(reference_dict)
    assert test_dict == reference_dict


# print("---")
# print(f"Generated data (JSON):\n{test_json}")
# print("---")
# print(f"Expected data (JSON):\n{stored_json}")


def _show_json(test=None, stored=None):
    import sys

    print("-" * 60)
    print("TEST VALUE")
    json.dump(test, sys.stdout)
    print()
    print("-" * 60)
    print("STORED VALUE")
    json.dump(stored, sys.stdout)


# create invalidFlowsheet as test instead of ConcreteModel, ConcreteModel has component_objs
class InvalidFlowsheet:
    """A mock flowsheet object without the 'component_objects' method."""

    pass


@pytest.mark.unit
def test_flowsheet_serializer_invalid():
    m = InvalidFlowsheet()
    pytest.raises(ValueError, FlowsheetSerializer, m, "bad")


@pytest.mark.unit
@pytest.mark.skipif(not helmholtz_available(), reason="General Helmholtz not available")
def test_flowsheet_serializer_get_unit_model_type():
    from idaes.core import MaterialBalanceType
    from idaes.models.unit_models.pressure_changer import (
        ThermodynamicAssumption,
    )
    from idaes.models.unit_models.heat_exchanger import (
        delta_temperature_underwood_callback,
    )
    from idaes.models.properties import iapws95
    from pyomo.environ import Set

    # flowsheet
    m = ConcreteModel(name="My Model")
    m.fs = FlowsheetBlock(dynamic=False)
    m.fs.prop_water = iapws95.Iapws95ParameterBlock(
        phase_presentation=iapws95.PhaseType.LG
    )

    # add & test scalar unit model
    m.fs.cond_pump = PressureChanger(
        property_package=m.fs.prop_water,
        material_balance_type=MaterialBalanceType.componentTotal,
        thermodynamic_assumption=ThermodynamicAssumption.pump,
    )
    unit_type = FlowsheetSerializer.get_unit_model_type(m.fs.cond_pump)
    assert unit_type == "pressure_changer"

    # add & test indexed unit model
    m.set_fwh = Set(initialize=[1, 2, 3, 4, 6, 7, 8])
    m.fs.fwh = HeatExchanger(
        m.set_fwh,
        delta_temperature_callback=delta_temperature_underwood_callback,
        hot_side={
            "property_package": m.fs.prop_water,
            "material_balance_type": MaterialBalanceType.componentTotal,
            "has_pressure_change": True,
        },
        cold_side={
            "property_package": m.fs.prop_water,
            "material_balance_type": MaterialBalanceType.componentTotal,
            "has_pressure_change": True,
        },
    )
    unit_type = FlowsheetSerializer.get_unit_model_type(m.fs.fwh)
    assert unit_type == "heat_exchanger"
