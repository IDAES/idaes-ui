from typing import Optional
from idaes_ui.fv.models.settings import AppSettings


class GetAppSettingRoute:
    def __init__(self, fastAPIApp, setting: Optional[int] = None):
        @fastAPIApp.get("/api/get_app_setting", tags=["Get App Setting"])
        def get_app_setting():
            return {"message": "get app setting"}
