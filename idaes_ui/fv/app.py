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

        # API
        # get flowsheet
        @self.app.get("/api/get_fs/")
        def get_flowsheet() -> Flowsheet:
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

        # save flowsheet
        @self.app.put("/api/put_fs/")
        def put_flowsheet(fs: Flowsheet):
            self.flowsheet = merge_flowsheets(self.flowsheet, fs)
            # todo: save result
            return self.flowsheet

        @self.app.get("/api/get_diagnostics/")
        async def get_diagnostics() -> DiagnosticsData:
            try:
                return self.diag_data
            except DiagnosticsException as exc:
                error_json = DiagnosticsError.from_exception(exc).model_dump_json()
                raise HTTPException(status_code=500, detail=error_json)

        @self.app.get("/api/get_settings/")
        def get_settings() -> AppSettings:
            return self.settings

        @self.app.put("/api/put_settings/")
        def put_settings(settings: AppSettings):
            self.settings = settings

        # mount static file
        # define root route
        @self.app.get("/")
        async def read_root():
            index_path = self._static_dir / "index.html"
            if not index_path.is_file():
                raise HTTPException(status_code=404, detail="Index file not found")
            return FileResponse(index_path)

        # mount static file folder
        self.app.mount("/", StaticFiles(directory=self._static_dir), name="reactBuild")

    def open_browser(self, port: int):
        """When FastAPI run, open browser with port.

        Args:
            port: the port FastAPI app running on, will open browser window with this port.
        """
        webbrowser.open("http://127.0.0.1:" + str(port))

    def run(self, port: int = 8000):
        """uvicorn run FastAPI, also call open browser but delay 1.5s

        Args:
            port: the port FastAPI app running on.
        """
        threading.Timer(1.5, lambda: self.open_browser(port)).start()
        uvicorn.run(self.app, host="127.0.0.1", port=port)
