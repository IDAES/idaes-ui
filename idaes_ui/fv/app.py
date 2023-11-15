"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
import sys

# from pathlib import Path

# external packages
from fastapi import FastAPI, HTTPException

# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse

# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError
from idaes_ui.fv.models.settings import AppSettings

# from idaes_ui.fv.models.flowsheet import Flowsheet, merge_flowsheets

# defined functions
from .fastAPI_functions.cors import enable_fastapi_cors
from idaes_ui.fv.fastAPI_functions.uvicorn import WebUvicorn

# defined route
from .fastAPI_route.router import Router


class FlowsheetApp:
    # _root_dir = Path(__file__).parent.absolute()  # static dir in same dir as this file
    # _static_dir = _root_dir / "reactBuild/"

    def __init__(self, flowsheet, name, port, save_time_interval):
        # populate web port
        if port:
            self.port = port
        else:
            self.port = 8000

        # initial everything related to flowsheet
        self.flowsheet = flowsheet
        self.flowsheet_name = name

        # initial FastAPI
        self.app = FastAPI(
            docs_url="/api/v1/docs",
            redoc="/api/v1/redoc",
            title="IDAES UI API DOC",
            description="IDAES UI API endpoint detail.",
        )

        # enable CORS let allowed port can talk to this server
        enable_fastapi_cors(self.app)

        # get diagnostics json
        self.diag_data = DiagnosticsData(flowsheet)

        # # get app flowsheet
        # self.flowsheet = Flowsheet(fs=flowsheet, name=name)

        # # API router
        Router(self.app, self.flowsheet, self.flowsheet_name, self.save_time_interval)

        # @self.app.put("/api/put_settings", tags=["App setting"])
        # def put_settings(settings: AppSettings):
        #     self.settings = settings

        # Uvicorn serve fastAPI app
        WebUvicorn(self.app, self.port)
