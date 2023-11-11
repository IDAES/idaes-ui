"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
import sys
from pathlib import Path

# external packages
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError
from idaes_ui.fv.models.settings import AppSettings
from idaes_ui.fv.models.flowsheet import Flowsheet, merge_flowsheets

# defined functions
from .fastAPI_functions.cors import enable_fastapi_cors
from idaes_ui.fv.fastAPI_functions.uvicorn import WebUvicorn


class FlowsheetApp:
    _root_dir = Path(__file__).parent.absolute()  # static dir in same dir as this file
    _static_dir = _root_dir / "reactBuild/"

    def __init__(self, flowsheet, name, port):
        # populate web port
        if port:
            self.port = port
        else:
            self.port = 8000

        # initial FastAPI
        self.app = FastAPI(
            docs_url="/api/v1/docs",
            redoc="/api/v1/redoc",
            title="IDAES UI API DOC",
            description="IDAES UI API endpoint detail.",
        )

        # enable CORS let allowed port can talk to this server
        enable_fastapi_cors(self.app)

        # get app setting
        # try:
        #     self.settings = self.set_time_interval
        # except:
        #     self.settings = AppSettings()

        # get diagnostics json
        self.diag_data = DiagnosticsData(flowsheet)

        # get app flowsheet
        self.flowsheet = Flowsheet(fs=flowsheet, name=name)

        # API
        # get flowsheet
        @self.app.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet() -> Flowsheet:
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

        # save flowsheet
        @self.app.put("/api/put_fs", tags=["Flowsheet"])
        def put_flowsheet(fs: Flowsheet):
            """API endpoint use for update flowsheet
            Args:
            fs: Flowsheet
            """
            self.flowsheet = merge_flowsheets(self.flowsheet, fs)
            # todo: save result
            return self.flowsheet

        @self.app.get("/api/get_diagnostics", tags=["Diagnostics"])
        async def get_diagnostics() -> DiagnosticsData:
            try:
                return self.diag_data
            except DiagnosticsException as exc:
                error_json = DiagnosticsError.from_exception(exc).model_dump_json()
                raise HTTPException(status_code=500, detail=error_json)

        @self.app.get("/api/get_settings", tags=["App setting"])
        def get_settings() -> AppSettings:
            return self.settings

        @self.app.put("/api/put_settings", tags=["App setting"])
        def put_settings(settings: AppSettings):
            self.settings = settings

        # mount static file
        # define root route
        @self.app.get("/", tags=["Static files"])
        async def read_root():
            index_path = self._static_dir / "index.html"
            if not index_path.is_file():
                raise HTTPException(status_code=404, detail="Index file not found")
            return FileResponse(index_path)

        # mount static file folder
        self.app.mount("/", StaticFiles(directory=self._static_dir), name="reactBuild")

        # Uvicorn serve fastAPI app
        WebUvicorn(self.app, self.port)
