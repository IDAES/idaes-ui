"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
<<<<<<< HEAD
from pathlib import Path
=======
import sys
from typing import Optional

# from pathlib import Path
>>>>>>> 219848c (add save dir and define self.save dir)

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

<<<<<<< HEAD
    def __init__(self, flowsheet, name="my flowsheet"):
        self.app = FastAPI()
        self.app.mount(
            "/static", StaticFiles(directory=self._static_dir), name="static"
=======
    def __init__(
        self, flowsheet, name, port, save_time_interval, save_dir: Optional[str] = None
    ):
        # populate web port
        if port:
            self.port = port
        else:
            self.port = 8000
        # initial save dir
        if save_dir:
            self.save_dir = save_dir
        else:
            self.save_dir = "./saved_flowsheet"

        # initial everything related to flowsheet
        self.flowsheet = flowsheet
        self.flowsheet_name = name

        # initial FastAPI
        self.app = FastAPI(
            docs_url="/api/v1/docs",
            redoc="/api/v1/redoc",
            title="IDAES UI API DOC",
            description="IDAES UI API endpoint detail.",
>>>>>>> 219848c (add save dir and define self.save dir)
        )
        self.diag_data = DiagnosticsData(flowsheet)
        self.settings = AppSettings()
        self.flowsheet = Flowsheet(fs=flowsheet, name=name)

<<<<<<< HEAD
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
=======
        # # API router
        Router(self.app, self.flowsheet, self.flowsheet_name, self.save_time_interval)
>>>>>>> 9f11168 (remove get flowsheet it's already in it's own route file)

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
