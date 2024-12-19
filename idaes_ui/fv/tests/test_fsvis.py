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
Tests for the IDAES Flowsheet Visualizer (IFV).

These are currently integration tests, because the start/stop the embedded HTTP server.
"""
import io
import logging
import glob
import json
import logging
import os
from pathlib import Path
import re
import time
import tempfile
import platform


import pytest
import asyncio
from playwright.async_api import async_playwright

requests = pytest.importorskip("requests")

from pyomo.environ import ConcreteModel
from idaes.core import FlowsheetBlock
from idaes.models.properties.activity_coeff_models.BTX_activity_coeff_VLE import (
    BTXParameterBlock,
)
from idaes.models.unit_models import Flash
from idaes_ui.fv import fsvis, errors, validate_flowsheet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def flash_model():
    """Flash unit model. Use '.fs' attribute to get the flowsheet."""
    m = ConcreteModel()
    m.fs = FlowsheetBlock(dynamic=False)
    # Flash properties
    m.fs.properties = BTXParameterBlock(
        valid_phase=("Liq", "Vap"), activity_coeff_model="Ideal", state_vars="FTPz"
    )
    # Flash unit
    m.fs.flash = Flash(property_package=m.fs.properties)
    m.fs.flash.inlet.flow_mol.fix(1)
    m.fs.flash.inlet.temperature.fix(368)
    m.fs.flash.inlet.pressure.fix(101325)
    m.fs.flash.inlet.mole_frac_comp[0, "benzene"].fix(0.5)
    m.fs.flash.inlet.mole_frac_comp[0, "toluene"].fix(0.5)
    m.fs.flash.heat_duty.fix(0)
    m.fs.flash.deltaP.fix(0)
    return m


@pytest.mark.integration
def test_visualize(flash_model, tmp_path):
    from pathlib import Path

    flowsheet = flash_model.fs
    # Start the visualization server
    result = fsvis.visualize(flowsheet, "Flash", browser=False, save_dir=tmp_path)
    # Get the model
    resp = requests.get(f"http://127.0.0.1:{result.port}/fs?id=Flash")
    data = resp.json()
    # Validate the model
    ok, msg = validate_flowsheet(data)
    assert ok, f"Invalid flowsheet returned: {msg}"
    assert data["model"]["id"] == "Flash"
    assert data["model"]["unit_models"]["flash"]["type"] == "flash"
    assert len(data["cells"]) == 7
    units = [x for x in data["cells"] if x["type"] == "standard.Image"]
    assert len(units) == 4
    unit_images = [Path(x["attrs"]["image"]["xlinkHref"]).name for x in units]
    unit_images.sort()
    assert unit_images == ["feed.svg", "flash.svg", "product.svg", "product.svg"]
    # Modify the model by deleting its one and only component
    flowsheet.del_component("flash")
    # Get the model (again)
    resp = requests.get(f"http://127.0.0.1:{result.port}/fs?id=Flash")
    data = resp.json()
    # Validate the modified model
    expected = {
        "model": {
            "id": "Flash",
            "stream_table": {"columns": ["Variable", "Units"], "data": [], "index": []},
            "unit_models": {},
            "arcs": {},
        },
        "cells": [],
        "routing_config": {},
    }
    assert data == expected


@pytest.mark.integration
def test_save_visualization(flash_model, tmp_path):
    # view logs from the persistence module
    logging.getLogger("idaes_ui.fv").setLevel(logging.DEBUG)
    flowsheet = flash_model.fs
    # Start the visualization server, using temporary save location
    save_location = tmp_path / "flash-vis.json"
    fsvis_result = fsvis.visualize(
        flowsheet, "Flash", browser=False, save=save_location, save_dir=tmp_path
    )
    # Check the contents of the saved file are the same as what is returned by the server
    with open(fsvis_result.store.filename) as fp:
        file_data = json.load(fp)
    resp = requests.get(f"http://127.0.0.1:{fsvis_result.port}/fs?id=Flash")
    net_data = resp.json()
    assert file_data == net_data


def _canonicalize(d):
    for cell in d["cells"]:
        if "ports" in cell:
            items = cell["ports"]["items"]
            cell["ports"]["items"] = sorted(items, key=lambda x: x["group"])


@pytest.mark.unit
def test_invoke(flash_model):
    # from inspect import signature -- TODO: use for checking params
    from idaes_ui import fv as fsvis_pkg

    functions = {
        "method": getattr(flash_model.fs, "visualize"),
        "package": getattr(fsvis_pkg, "visualize"),
        "module": getattr(fsvis, "visualize"),
    }
    # TODO: check params


@pytest.mark.unit
def test_visualize_fn(flash_model):
    flowsheet = flash_model.fs
    result = fsvis.visualize(flowsheet, browser=False, save=False)
    assert result.store.filename == ""
    #
    for bad_save_as in (1, "/no/such/file/exists.I.hope", flowsheet):
        with pytest.raises(errors.VisualizerError):
            fsvis.visualize(flowsheet, save=bad_save_as, browser=False)


@pytest.mark.unit
def test_flowsheet_name(flash_model, tmp_path):
    raw_name = "Hello World"
    result = fsvis.visualize(
        flash_model.fs, name=raw_name, browser=False, save_dir=tmp_path
    )
    assert re.search(raw_name, result.store.filename)


@pytest.mark.unit
def test_mock_webbrowser(flash_model):
    from idaes_ui.fv import fsvis

    wb = fsvis.webbrowser
    for wb_mock in (MockWB(True), MockWB(False)):
        fsvis.webbrowser = wb_mock
        _ = fsvis.visualize(flash_model.fs, save=False)
    fsvis.webbrowser = wb


class MockWB:
    """Use this instead of a real web browser."""

    def __init__(self, ok):
        self.ok = ok

    def open(self, *args):
        return self.ok


# Test saving of the status file


@pytest.fixture
def save_files_prefix(tmp_path):
    value = str(tmp_path / "test_visualize")
    # clear out any cruft
    for filename in glob.glob(str(tmp_path / "test_visualize*")):
        os.unlink(filename)
    yield value
    # clear out any cruft (2)
    for filename in glob.glob(str(tmp_path / "test_visualize*")):
        os.unlink(filename)


@pytest.mark.unit
def test_visualize_save_versions(flash_model, save_files_prefix):
    # test versioned file saves
    flowsheet = flash_model.fs
    path = Path(save_files_prefix + "_save")
    work_dir = path.parent
    fs_name = path.name
    for i in range(4):
        save_arg = (True, None)[i % 2]  # try both kinds of 'use default' values
        if i < 3:
            result = fsvis.visualize(
                flowsheet,
                fs_name,
                save_dir=work_dir,
                browser=False,
                save=save_arg,
                load_from_saved=False,
            )
            if i == 0:
                assert re.search(f"{path.name}.json", result.store.filename)
            else:
                assert re.search(rf"{path.name}.*{i}.*\.json", result.store.filename)
        else:
            msv, fsvis.MAX_SAVED_VERSIONS = fsvis.MAX_SAVED_VERSIONS, i - 1
            with pytest.raises(RuntimeError):
                fsvis.visualize(
                    flowsheet,
                    fs_name,
                    save_dir=work_dir,
                    browser=False,
                    load_from_saved=False,
                )
            fsvis.MAX_SAVED_VERSIONS = msv


@pytest.mark.unit
def test_visualize_save_explicit(flash_model, save_files_prefix):
    # test explicit filename
    flowsheet = flash_model.fs
    howdy = Path(save_files_prefix + "_howdy")
    result = fsvis.visualize(flowsheet, "flowsheet", save=howdy, browser=False)
    assert re.search(howdy.name, result.store.filename)
    # overwrite but this time break explicit file into relative name and directory
    result = fsvis.visualize(
        flowsheet,
        "flowsheet",
        save=howdy.name,
        save_dir=howdy.parent,
        browser=False,
        overwrite=True,
    )
    assert re.search(howdy.name, result.store.filename)


@pytest.mark.unit
def test_visualize_save_cannot(flash_model, tmp_path):
    flowsheet = flash_model.fs
    with pytest.raises(errors.VisualizerError):
        fsvis.visualize(flowsheet, "foo", save="foo", save_dir=Path("/a/b/c/d/e/f/g"))


@pytest.mark.unit
def test_visualize_save_overwrite(flash_model, save_files_prefix):
    flowsheet = flash_model.fs
    howdy = Path(save_files_prefix + "_howdy")
    howdy.open("w").write("howdy")
    howdy_stat = os.stat(howdy)
    result = fsvis.visualize(
        flowsheet,
        "flowsheet",
        save=howdy,
        overwrite=True,
        browser=False,
        load_from_saved=False,
    )
    howdy_stat2 = os.stat(result.store.filename)
    assert (
        howdy_stat2.st_mtime >= howdy_stat.st_mtime
    )  # modification time should be later


@pytest.mark.unit
def test_visualize_save_loadfromsaved(flash_model, save_files_prefix):
    flowsheet = flash_model.fs
    name = "flash_tvslfs"
    save_dir = Path(save_files_prefix).parent
    # save initial
    result = fsvis.visualize(flowsheet, name, save_dir=save_dir, browser=False)
    path_base = save_dir / (name + ".json")
    assert path_base.exists()
    # this time, should use loaded one
    # there should still be only one file
    result = fsvis.visualize(flowsheet, name, save_dir=save_dir, browser=False)
    path_v1 = save_dir / (name + "-1.json")
    assert not path_v1.exists()
    # same behavior with explicit flag
    result = fsvis.visualize(
        flowsheet, name, save_dir=save_dir, browser=False, load_from_saved=True
    )
    assert not path_v1.exists()


@pytest.mark.unit
def test_pick_default_save_location():
    from idaes_ui.fv.fsvis import _pick_default_save_location as pdsl

    p = pdsl("foo", None)
    assert str(p).endswith("foo.json")
    p = pdsl("foo", Path("/a"))
    assert p == Path("/a") / "foo.json"


@pytest.mark.unit
def test_existing_save_path(tmp_path):
    from idaes_ui.fv.fsvis import _handle_existing_save_path as hesp

    name = "foo"
    save_path = tmp_path / (name + ".json")
    # not there
    p = hesp(name, save_path)
    assert p == save_path
    # version 1
    save_path.open("w").write("hello")
    p1 = hesp(name, save_path)
    assert p1 != save_path
    # version 2
    p1.open("w").write("hello")
    p2 = hesp(name, save_path)
    assert str(p2) > str(p1)
    # version too far
    p2.open("w").write("hello")
    with pytest.raises(errors.TooManySavedVersions):
        p3 = hesp(name, save_path, max_versions=2)
    # infinite versions
    p4 = hesp(name, save_path, max_versions=0)
    assert str(p4) > str(p2)
    # overwrite
    p0 = hesp(name, save_path, overwrite=True)
    assert p0 == save_path


@pytest.mark.component
def test_loop_forever():
    from threading import Thread

    for quietness in (True, False):
        thr = Thread(target=fsvis._loop_forever, args=(quietness,), daemon=True)
        thr.start()
        # wait a while, make sure it's still alive
        print("sleeping")
        time.sleep(3)
        print("check thread")
        assert thr.is_alive()
    # threads should die when process exits


@pytest.mark.unit
def test_visualize_return(flash_model):
    flowsheet = flash_model.fs
    visualizer = fsvis.visualize(flowsheet, browser=False, save=False)

    assert hasattr(visualizer, "store")
    assert hasattr(visualizer, "port")
    assert hasattr(visualizer, "server")
    assert hasattr(visualizer, "save_diagram")


@pytest.fixture(scope="module")
def browser():
    with async_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()


def clear_screenshot_folder(folder_path: str, extensions: list[str]):
    """
    define a pytest utility tool function, read from screenshots folder, if any png or svg files exist, remove them first
    Args:
        folder_path: str, the path of the folder to clear
        extensions: list[str], the list of file extensions to remove
    """
    for file in os.listdir(folder_path):
        if any(file.endswith(ext) for ext in extensions):
            os.remove(os.path.join(folder_path, file))


@pytest.mark.integration
def test_saved_diagram_as_svg_and_png(flash_model):
    """
    test visualizer.save_diagram saved diagram as svg in screenshots folder
    """

    flowsheet_name = "test_diagram"

    # define file name list to check if saved
    screenshot_file_names = [f"{flowsheet_name}.png", f"{flowsheet_name}.svg"]

    # define screenshot save path
    screenshot_save_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "screenshots",
    )

    # make sure dir is exist
    os.makedirs(screenshot_save_path, exist_ok=True)

    # cleanup screenshot folder
    clear_screenshot_folder(screenshot_save_path, [".png", ".svg"])

    try:
        # Run visualizer and save diagram
        visualizer = fsvis.visualize(flash_model.fs, flowsheet_name, browser=False)

        # save svg screenshot
        visualizer.save_diagram(
            screenshot_name=flowsheet_name,
            image_type="svg",
            screenshot_save_to=screenshot_save_path,
            display=False,
        )

        # check if svg file is saved
        assert os.path.exists(
            os.path.join(screenshot_save_path, f"{flowsheet_name}.svg")
        )

        # save png screenshot
        visualizer.save_diagram(
            screenshot_name=flowsheet_name,
            image_type="png",
            screenshot_save_to=screenshot_save_path,
            display=False,
        )
        # check if png file is saved
        assert os.path.exists(
            os.path.join(screenshot_save_path, f"{flowsheet_name}.png")
        )

    finally:
        clear_screenshot_folder(
            screenshot_save_path, [f"{flowsheet_name}.png", f"{flowsheet_name}.svg"]
        )


@pytest.mark.integration
def test_export_flowsheet_diagram(flash_model, tmp_path):
    flowsheet = flash_model.fs

    # work in a temporary directory managed by pytest
    os.chdir(tmp_path)

    def check_file(path: Path, bytes: int = 10):
        assert path.exists()
        assert path.is_file()
        assert path.stat().st_size >= bytes

    # Happy paths

    # write SVG to file in current directory
    fsvis.export_flowsheet_diagram(flowsheet, "foo.svg")
    check_file(tmp_path / "foo.svg")
    fsvis.export_flowsheet_diagram(flowsheet, Path("foo.svg"))
    check_file(tmp_path / "foo.svg")

    # write PNG to file in current directory
    fsvis.export_flowsheet_diagram(flowsheet, "foo.png")
    check_file(tmp_path / "foo.png")

    # write SVG to file in subdirectory
    fsvis.export_flowsheet_diagram(flowsheet, "./bar/foo.svg")
    check_file(tmp_path / "bar" / "foo.svg")
    fsvis.export_flowsheet_diagram(flowsheet, Path("./bar/foo.svg"))
    check_file(tmp_path / "bar" / "foo.svg")

    ## Unhappy paths

    with pytest.raises(ValueError):
        fsvis.export_flowsheet_diagram(flowsheet, "foo.txt")

    with pytest.raises(ValueError):
        fsvis.export_flowsheet_diagram(flowsheet, "foo")

    if platform.system() != "Windows":
        with pytest.raises(IOError):
            fsvis.export_flowsheet_diagram(
                flowsheet, Path("/") / "aoxomoxoa" / "foo.svg"
            )

    # TODO: test Windows
