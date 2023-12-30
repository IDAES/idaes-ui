from pydantic import BaseModel


class AppSettingsSchema(BaseModel):
    new_save_time_interval: int


class PutAppSettingRoute:
    def __init__(self, fastAPIApp, flowsheet_manager):
        @fastAPIApp.put("/api/put_app_setting", tags=["Put App Setting"])
        def put_app_setting(req_body: AppSettingsSchema):
            new_save_time_interval = req_body.new_save_time_interval
            flowsheet_manager.update_save_time_interval(new_save_time_interval)

            return {
                "message": f"save time interval is update to {new_save_time_interval}"
            }
