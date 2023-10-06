from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from pathlib import Path

_root_dir = Path(__file__).parent.parent.absolute()
_static_dir = _root_dir / "static"

from idaes_ui.fv.api import DiagnosticsData, DiagnosticsError


def start_server(flowsheet, port: int = 8000) -> FastAPI:

    app = FastAPI()
    app.mount("/static", StaticFiles(directory=_static_dir), name="static")

    diag_data = DiagnosticsData(flowsheet)

    @app.get("/diagnostics/")
    async def get_diagnostics() -> DiagnosticsData:
        return diag_data

    uvicorn.run(app, host="127.0.0.1", port=port)

    return app
