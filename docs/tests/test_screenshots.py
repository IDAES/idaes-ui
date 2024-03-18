"""
Generate UI screenshots with Playwright's pytest plugin
"""
# stdlib
from enum import Enum
from pathlib import Path
import re
import time
from typing import Iterable

# third-party
from playwright.sync_api import Page, expect
import pytest

# package
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet
from idaes_ui.fv import visualize

__author__ = "Dan Gunter"
__created__ = "2024-03-18"

# Programmatically implement the naming convention for screenshot files


class ScreenMode(Enum):
    view = "view"
    diagnostics = "diag"


class ScreenElement(Enum):
    diagnostic_logs = "di"
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
        if len(self._sorted_elements) == 0:
            raise ValueError("At least one value required for 'elements'")
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

        Returns:
            Filename
        """
        if self._cached_filename is None:
            base = f"fv-{self._mode.value}"
            elements = "_".join(self._sorted_elements)
            self._cached_filename = f"{base}_{elements}.{self._ext}"
        return self._cached_filename

    @property
    def filepath(self) -> Path:
        return self._fv_path / self.filename


# Flowsheet visualizer example


class FVExample:
    port = 49999
    app = "sample_visualization"

    def __init__(self):
        model = build_flowsheet()
        visualize(model.fs, self.app, port=self.port, browser=False)

    @property
    def url(self):
        return f"http://localhost:{self.port}/app?id={self.app}"


@pytest.fixture(scope="function", autouse=True)
def fv():
    fv = FVExample()
    return fv


def load(page, fv, sleep=5):
    """Custom wait, for diagram to render after page starts.
    """
    page.goto(fv.url)
    time.sleep(sleep)  # there should be a better way, but whatever
    loc = page.locator("svg[joint-selector='svg']")
    expect(loc).to_have_id("v-2")

# Generate screenshots with 'tests'


def test_basic(page: Page, fv: FVExample):
    load(page, fv, sleep=1)

    # Expect a title "to contain" a substring.
    expect(page).to_have_title(re.compile("idaes flowsheet visualizer", flags=re.I))


def test_screenshots_view(page: Page, fv: FVExample):
    load(page, fv)

    # default view
    scs = ScreenShot(
        mode=ScreenMode.view,
        elements=[ScreenElement.flowsheet_diagram, ScreenElement.stream_table],
    )
    print(f"creating screenshot in path: {scs.filepath}")
    page.screenshot(path=scs.filepath)

    # deactivate the stream table
    # XXX: not done
