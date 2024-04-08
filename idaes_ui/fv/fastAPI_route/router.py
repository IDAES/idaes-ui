from typing import Optional

# import function
from idaes_ui.fv.fastAPI_functions.flowsheet_manager import FlowsheetManager

# import routes
from .api_get_flowsheet_route import GetFlowsheetRoute
from .api_put_flowsheet_route import PutFlowsheetRoute
from .api_get_diagnostics_route import GetDiagnosticsRoute
from .api_get_app_setting_route import GetAppSettingRoute
from .api_put_app_setting_route import PutAppSettingRoute
from .api_get_react_app_route import GetReactAppRoute
from .api_post_health_check_route import PostHealthCheck
from .api_post_save_flowsheet import PostSaveFlowsheet


class Router:
    def __init__(
        self,
        fastAPIApp,
        flowsheet,
        flowsheet_name,
        save_time_interval: int,
        save,
        save_dir,
        load_from_saved,
        overwrite,
    ):
        """Main router class use to call routes and pass params down to each route base on it needs
        Args:
            fastAPIApp: fastAPI app defined in parent class
            flowsheet_name: the name of flowsheet pass from fsvis -> FlowsheetApp
            flowsheet: flowsheet object pass from fsvis -> FlowsheetApp
            save_time_interval: Optional, default is 5s, use to define how long does flowsheet should save
        """
        # call flowsheet manager
        # this is not a route this is a universal class help routes to process flowsheet
        flowsheet_manager = FlowsheetManager(
            flowsheet=flowsheet,
            flowsheet_name=flowsheet_name,
            save_time_interval=save_time_interval,
        )

        # api end point post health check
        PostHealthCheck(fastAPIApp)

        # api end point get flowsheet
        GetFlowsheetRoute(fastAPIApp, flowsheet_manager, flowsheet_name, save_dir)

        # api end point put flowsheet
        PutFlowsheetRoute(fastAPIApp, flowsheet_manager, save_dir)

        # api end point get diagnostics
        GetDiagnosticsRoute(fastAPIApp, flowsheet_manager)

        # api end point get app setting
        GetAppSettingRoute(fastAPIApp, flowsheet_manager)

        # api end point get app setting
        PutAppSettingRoute(fastAPIApp, flowsheet_manager)

        # api end point save flowsheet
        PostSaveFlowsheet(
            fastAPIApp,
            flowsheet_manager,
            flowsheet,
            flowsheet_name,
            save,
            save_dir,
            load_from_saved,
            overwrite,
        )

        # api end point serve react app
        # static router has to defined at end
        GetReactAppRoute(fastAPIApp)
