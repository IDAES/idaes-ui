from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from pathlib import Path


from idaes_ui.fv.api import DiagnosticsData, DiagnosticsError


class FlowsheetServer:
    _root_dir = Path(__file__).parent.parent.absolute()
    _static_dir = _root_dir / "static"

    def __init__(self, flowsheet):
        self.app = FastAPI()
        self.app.mount("/static", StaticFiles(directory=self._static_dir), name="static")
        self.diag_data = DiagnosticsData(flowsheet)

        @self.app.get("/diagnostics/")
        async def get_diagnostics() -> DiagnosticsData:
            return self.diag_data

    def start_server(self, port: int = 8000):
        uvicorn.run(self.app, host="127.0.0.1", port=port)
