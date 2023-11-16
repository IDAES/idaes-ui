"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
import sys
from typing import Optional

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
from .fastAPI_functions.initial_params import InitialParams
from .fastAPI_functions.cors import enable_fastapi_cors
from idaes_ui.fv.fastAPI_functions.uvicorn import WebUvicorn

# defined route
from .fastAPI_route.router import Router


class FlowsheetApp:
    # _root_dir = Path(__file__).parent.absolute()  # static dir in same dir as this file
    # _static_dir = _root_dir / "reactBuild/"

    def __init__(
        self,
        flowsheet,
        name,
        port: Optional[int] = None,
        save_time_interval: Optional[int] = None,
        save_dir: Optional[str] = None,
    ):
        # Initial self.... params
        InitialParams(
            main_class=self,
            flowsheet=flowsheet,
            name=name,
            port=port,
            save_time_interval=save_time_interval,
            save_dir=save_dir,
        )

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

        # # API router
        Router(
            fastAPIApp=self.app,
            flowsheet=self.flowsheet,
            flowsheet_name=self.flowsheet_name,
            save_dir=self.save_dir,
            save_time_interval=self.save_time_interval,
        )

        # @self.app.put("/api/put_settings", tags=["App setting"])
        # def put_settings(settings: AppSettings):
        #     self.settings = settings

        # Uvicorn serve fastAPI app
        WebUvicorn(self.app, self.port)
