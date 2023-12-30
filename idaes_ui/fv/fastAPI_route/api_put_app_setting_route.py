from pydantic import BaseModel


class AppSettingsSchema(BaseModel):
    save_time_interval: int


class PutAppSettingRoute:
    def __init__(self, fastAPIApp, flowsheet_manager):
        @fastAPIApp.put("/api/put_app_setting", tags=["Put App Setting"])
        def put_app_setting(req_body: AppSettingsSchema):
            new_save_time_interval = req_body.save_time_interval
            print("in put np")
            print(new_save_time_interval)
            flowsheet_manager.update_save_time_interval(new_save_time_interval)

            return {
                "save_time_interval": new_save_time_interval,
            }
