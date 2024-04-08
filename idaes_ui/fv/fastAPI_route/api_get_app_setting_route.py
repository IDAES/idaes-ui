from typing import Optional


class GetAppSettingRoute:
    def __init__(self, fastAPIApp, flowsheet_manager):
        @fastAPIApp.get("/api/get_app_setting", tags=["Get App Setting"])
        def get_app_setting():
            save_time_interval = flowsheet_manager.get_save_time_interval()
            return {
                "save_time_interval": save_time_interval,
            }
