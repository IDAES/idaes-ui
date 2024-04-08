# stdlib
from pathlib import Path

# external packages
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


class GetReactAppRoute:
    def __init__(self, fastAPIApp):
        # define react app static file dir
        _root_dir = Path(
            __file__
        ).parent.absolute()  # ! static dir in not in same dir as this file
        _static_dir = _root_dir.parents[0] / "static/"

        @fastAPIApp.get("/", tags=["Static files"])
        async def read_static_root():
            index_path = _static_dir / "index.html"
            if not index_path.is_file():
                raise HTTPException(status_code=404, detail="Index file not found")
            return FileResponse(index_path)

        # mount static file folder
        fastAPIApp.mount("/", StaticFiles(directory=_static_dir), name="reactBuild")
