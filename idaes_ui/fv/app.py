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
from fastapi.responses import FileResponse
import uvicorn
import webbrowser
import threading
# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError
from idaes_ui.fv.models.settings import AppSettings
from idaes_ui.fv.models.flowsheet import Flowsheet, merge_flowsheets


class FlowsheetApp:
    _root_dir = Path(__file__).parent.absolute()  # static dir in same dir as this file
    _static_dir = _root_dir / "reactBuild/"

    def __init__(self, flowsheet, name="my flowsheet"):
        # initial FastAPI
        self.app = FastAPI()

        self.diag_data = DiagnosticsData(flowsheet)
        self.settings = AppSettings()
        self.flowsheet = Flowsheet(fs=flowsheet, name=name)

        # define root route
        @self.app.get("/")
        async def read_root():
            index_path = self._static_dir / "index.html"
            if not index_path.is_file():
                raise HTTPException(status_code=404, detail="Index file not found")
            return FileResponse(index_path)
        # mount static file folder
        self.app.mount("/", StaticFiles(directory=self._static_dir), name="reactBuild")
        
        # get flowsheet
        @self.app.get("/fs/")
        def get_flowsheet() -> Flowsheet:
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

        # save flowsheet
        @self.app.put("/fs/")
        def put_flowsheet(fs: Flowsheet):
            self.flowsheet = merge_flowsheets(self.flowsheet, fs)
            # todo: save result
            return self.flowsheet
        
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
