from typing import Optional

# import routes
from .api_get_flowsheet_route import GetFlowsheetRoute
from .api_put_flowsheet_route import PutFlowsheetRoute
from .api_get_diagnostics_route import GetDiagnosticsRoute
from .api_get_app_setting_route import GetAppSettingRoute
from .api_get_react_app_route import GetReactAppRoute


class Router:
    def __init__(
        self,
        fastAPIApp,
        flowsheet,
        flowsheet_name,
        save_dir,
        save_time_interval: Optional[int] = None,
    ):
        """Main router class use to call routes and pass params down to each route base on it needs
        Args:
            fastAPIApp: fastAPI app defined in parent class
            flowsheet_name: the name of flowsheet pass from fsvis -> FlowsheetApp
            flowsheet: flowsheet object pass from fsvis -> FlowsheetApp
            save_time_interval: Optional, default is 5s, use to define how long does flowsheet should save
        """
        # api end point get flowsheet
        GetFlowsheetRoute(fastAPIApp, flowsheet, flowsheet_name, save_dir)

        # api end point put flowsheet
        PutFlowsheetRoute(fastAPIApp, save_dir)

        # api end point get diagnostics
        GetDiagnosticsRoute(fastAPIApp, flowsheet)

        # api end point get app setting
        GetAppSettingRoute(fastAPIApp, save_time_interval)

        # api end point serve react app
        # static router has to defined at end
        GetReactAppRoute(fastAPIApp)
