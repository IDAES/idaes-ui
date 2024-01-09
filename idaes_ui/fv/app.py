"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
import sys
from pathlib import Path
from typing import Optional, Union, Dict, Tuple

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
    def __init__(
        self,
        flowsheet,
        name,
        port: Optional[int] = None,
        save_time_interval: Optional[int] = 5,
        save: Optional[Union[Path, str, bool]] = None,
        save_dir: Optional[Path] = None,
        load_from_saved: bool = True,
        overwrite: bool = False,
        test: bool = False,
        browser: bool = True,
    ):
        # Initial self.... params
        InitialParams(
            main_class=self,
            flowsheet=flowsheet,
            name=name,
            port=port,
            save_time_interval=save_time_interval,
            save=save,
            save_dir=save_dir,
            load_from_saved=load_from_saved,
            overwrite=overwrite,
            test=test,
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

        # API router
        Router(
            fastAPIApp=self.app,
            flowsheet=self.flowsheet,
            flowsheet_name=self.flowsheet_name,
            save_time_interval=self.save_time_interval,
            save=self.save,
            save_dir=self.save_dir,
            load_from_saved=self.load_from_saved,
            overwrite=self.overwrite,
        )

        # print message why browser not start
        if self.test:
            print("Test mode enabled with 'test = True', browser won't start!")
        if not browser:
            print(
                "Browser mode disenabled with 'browser = False', browser won't start!"
            )

        # # Uvicorn serve fastAPI app
        # # condation not test only not test case will start uvicorn
        if not self.test and browser:
            WebUvicorn(self.app, self.port, self.flowsheet_name)

    def get_fast_api_app(self):
        return self.app
