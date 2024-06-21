"""
Generate UI screenshots with Playwright's pytest plugin.

Run `pytest -s -m screenshot` to generate the screenshots in the directory 'docs/static/fv'.
See :class:`Screenshot.filename` for the naming convention.

"""

# stdlib
from enum import Enum
from pathlib import Path
import re
import time
from typing import Iterable
import socket


# third-party
import pytest
pytest.importorskip("playwright", reason="Playwright not installed")
from playwright.sync_api import Page, expect

# package
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet
from idaes_ui.fv import visualize, fsvis

__author__ = "Dan Gunter"
__created__ = "2024-03-18"

# Programmatically implement the naming convention for screenshot files


class ScreenMode(Enum):
    view = "view"
    diagnostics = "diag"


class ScreenElement(Enum):
    diagnostics = "di"
    diagnostic_logs = "di_log"
    flowsheet_diagram = "fs"
    model_tree = "tr"
    solver_logs = "sl"
    stream_table = "tb"


class ScreenShot:
    """Encapsulate a naming convention for screenshot files.

    Example usage::

        scs = ScreenShot(ScreenMode.view, (ScreenElement.flowsheet_diagram,
                         ScreenElement.stream_table))
        filename = scs.filepath  # -> "/<path>/<to>/<static>/fv-view_di_tb.png"
    """

    def __init__(
        self, mode: ScreenMode, elements: Iterable[ScreenElement], ext: str = "png"
    ):
        """Generate canonical screenshot file names.

        See `filename` method.


        Args:
            mode: Top-level mode
            elements: One or more things shown in the screenshot
            ext: File extension

        Raises:
            ValueError: if there is not at least 1 element
        """
        self._sorted_elements = [e.value for e in elements]
        self._sorted_elements.sort()
        self._mode = mode
        self._cached_filename = None
        self._ext = ext

        tests_path = Path(__file__).parent
        static_path = tests_path.parent / "static"
        self._fv_path = (static_path / "fv").absolute()

    @property
    def filename(self) -> str:
        """Return filename for this screenshot.

        Pattern: `fv-<mode>_<element1>_<element2>..._<elementN>.<ext>`

        Where <mode> is the value of an instance of ScreenMode
        and <elementN> is the value of an instance of ScreenElement.
        The <element> items are in alphabetical order.

        Returns:
            Filename
        """
        if self._cached_filename is None:
            base = f"fv-{self._mode.value}"
            if len(self._sorted_elements) == 0:
                elements = ""
            else:
                elements = "_" + "_".join(self._sorted_elements)
            self._cached_filename = f"{base}{elements}.{self._ext}"
        return self._cached_filename

    @property
    def filepath(self) -> Path:
        return self._fv_path / self.filename


# Flowsheet visualizer example


class FVExample:
    port = 49999
    app = "sample_visualization"

    def __init__(self):
        print("server start by fsvis")

        self.port = self.find_free_port(self.port)
        model = build_flowsheet()
        # shutdown any running instance before we start
        if fsvis.web_server and fsvis.web_server.port != self.port:
            fsvis.web_server.shutdown()
            fsvis.web_server = None
        visualize(model.fs, self.app, port=self.port, browser=False)

    @staticmethod
    def find_free_port(starting_port):
        port = starting_port
        while True:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", port)) != 0:
                    return port
                port += 1

    @property
    def url(self):
        return f"http://localhost:{self.port}/app?id={self.app}"


@pytest.fixture(scope="function", autouse=True)
def fv():
    fv = FVExample()
    print(fsvis.web_server.__dict__)
    return fv


def load(page, fv):
    """Custom wait, for diagram to render after page starts."""
    page.goto(fv.url)
    loc = page.locator("svg[joint-selector='svg']")
    expect(loc).to_have_id("v-2")


# Generate screenshots with 'tests'


@pytest.mark.unit
def test_basic(page: Page, fv: FVExample):
    load(page, fv)

    # Expect a title "to contain" a substring.
    expect(page).to_have_title(re.compile("idaes flowsheet visualizer", flags=re.I))


def pause():
    """There *must* be a better way to do this, but this works for screenshots.."""
    print("Begin: pause for page to update")
    time.sleep(10)
    print("End: pause for page to update")


@pytest.mark.screenshot
def test_screenshots_view(page: Page, fv: FVExample):
    """Generate screenshots for different panel view options."""
    load(page, fv)
    pause()

    # default view
    scs = ScreenShot(
        mode=ScreenMode.view,
        elements=[ScreenElement.flowsheet_diagram, ScreenElement.stream_table],
    )
    print(f"creating screenshot in path: {scs.filepath}")
    pause()
    page.screenshot(path=scs.filepath)

    # open diagnostics
    btn = page.locator("#headerDiagnosticsBtn")
    btn.wait_for()
    btn.click()
    scs = ScreenShot(
        mode=ScreenMode.view,
        elements=[ScreenElement.diagnostics],
    )
    print(f"creating screenshot in path: {scs.filepath}")
    pause()
    page.screenshot(path=scs.filepath)

    ## minimize btn is not there anymore turn it off wait for future
    # minimize stream table
    # btn = page.locator("#minimize-streamtable-panel-btn")
    # btn.wait_for()
    # btn.click()
    # scs = ScreenShot(
    #     mode=ScreenMode.view,
    #     elements=[ScreenElement.flowsheet_diagram],
    # )
    # print(f"creating screenshot in path: {scs.filepath}")
    # pause()
    # page.screenshot(path=scs.filepath)

    # # # minimize flowsheet too (!)
    # btn = page.locator("#minimize-flowsheet-panel-btn")
    # btn.wait_for()
    # btn.click()
    # scs = ScreenShot(
    #     mode=ScreenMode.view,
    #     elements=[],
    # )
    # print(f"creating screenshot in path: {scs.filepath}")
    # pause()
    # page.screenshot(path=scs.filepath)
