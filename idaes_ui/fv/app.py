"""
Application server for IDAES UI
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-08"

# stdlib
import sys
import asyncio
from pathlib import Path

# external packages
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
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

        # enable CORS let port 5173 can talk to this server
        origins = [
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,  # allowed url list
            allow_credentials=True,  # support cookies
            allow_methods=["*"],  # allowed methord
            allow_headers=["*"],  # allowed header
        )

        # get app setting
        try:
            self.settings = self.set_time_interval
        except:
            self.settings = AppSettings()

        # get diagnostics json
        self.diag_data = DiagnosticsData(flowsheet)

        # get app flowsheet
        self.flowsheet = Flowsheet(fs=flowsheet, name=name)

        # API
        # get flowsheet
        @self.app.get("/api/get_fs")
        def get_flowsheet() -> Flowsheet:
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

        # save flowsheet
        @self.app.put("/api/put_fs")
        def put_flowsheet(fs: Flowsheet):
            self.flowsheet = merge_flowsheets(self.flowsheet, fs)
            # todo: save result
            return self.flowsheet

        @self.app.get("/api/get_diagnostics")
        async def get_diagnostics() -> DiagnosticsData:
            try:
                return self.diag_data
            except DiagnosticsException as exc:
                error_json = DiagnosticsError.from_exception(exc).model_dump_json()
                raise HTTPException(status_code=500, detail=error_json)

        @self.app.get("/api/get_settings")
        def get_settings() -> AppSettings:
            return self.settings

        @self.app.put("/api/put_settings")
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
        """When FastAPI run, open browser on localhost with port.

        Args:
            port: the port FastAPI app running on, will open browser window with this port.
        """
        webbrowser.open(f"http://127.0.0.1:{port}")

    async def serve(self, port: int):
        """Setup uvicorn server loop with asyncio

        Args:
            port: the port FastAPI app running on.

        Returns:
            server: configed uvicorn server
        """
        # Replace 'config' with the appropriate uvicorn configuration
        config = uvicorn.Config(self.app, host="127.0.0.1", port=port, loop="asyncio")
        server = uvicorn.Server(config)
        await server.serve()
        return server

    def run(self, port: int = 8000):
        """run FastAPI server with uvicorn, also call open browser but delay 1.5s

        Args:
            port: the port FastAPI app running on.
        """
        loop = asyncio.get_event_loop()

        # Check if we are in a Jupyter notebook environment.
        if "ipykernel" in sys.modules and "nest_asyncio" in sys.modules:
            import nest_asyncio

            nest_asyncio.apply()

        # Open the browser after a delay
        threading.Timer(1.5, self.open_browser, args=(port,)).start()

        # Run the uvicorn server
        loop.run_until_complete(self.serve(port))
