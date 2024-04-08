"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
from pathlib import Path

# external packages
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
import uvicorn

# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError
from idaes_ui.fv.models.settings import AppSettings
from idaes_ui.fv.models.flowsheet import Flowsheet, merge_flowsheets


class FlowsheetApp:
    _root_dir = Path(__file__).parent.absolute()  # static dir in same dir as this file
    _static_dir = _root_dir / "static"

    def __init__(self, flowsheet, name="my flowsheet"):
        self.app = FastAPI()
        self.app.mount(
            "/static", StaticFiles(directory=self._static_dir), name="static"
        )
        self.diag_data = DiagnosticsData(flowsheet)
        self.settings = AppSettings()
        self.flowsheet = Flowsheet(fs=flowsheet, name=name)

        @self.app.get("/diagnostics/")
        async def get_diagnostics() -> DiagnosticsData:
            try:
                return self.diag_data
            except DiagnosticsException as exc:
                error_json = DiagnosticsError.from_exception(exc).model_dump_json()
                raise HTTPException(status_code=500, detail=error_json)

        @self.app.get("/settings/")
        def get_settings() -> AppSettings:
            return self.settings

        @self.app.put("/settings/")
        def put_settings(settings: AppSettings):
            self.settings = settings

        @self.app.get("/fs/")
        def get_flowsheet() -> Flowsheet:
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

        @self.app.put("/fs/")
        def put_flowsheet(fs: Flowsheet):
            self.flowsheet = merge_flowsheets(self.flowsheet, fs)
            # todo: save result
            return self.flowsheet

    def run(self, port: int = 8000):
        uvicorn.run(self.app, host="127.0.0.1", port=port)
