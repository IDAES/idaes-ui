"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
from pathlib import Path
# external packages
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn
# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError


class FlowsheetApp:
    _root_dir = Path(__file__).parent.parent.absolute()
    _static_dir = _root_dir / "static"

    def __init__(self, flowsheet):
        self.app = FastAPI()
        self.app.mount(
            "/static", StaticFiles(directory=self._static_dir), name="static"
        )
        self.diag_data = DiagnosticsData(flowsheet)

        @self.app.get("/diagnostics/")
        async def get_diagnostics() -> DiagnosticsData:
            try:
                return self.diag_data
            except DiagnosticsException as exc:
                return DiagnosticsError.from_exception(exc)

    def run(self, port: int = 8000):
        uvicorn.run(self.app, host="127.0.0.1", port=port)
