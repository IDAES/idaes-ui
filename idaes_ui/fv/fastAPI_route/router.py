# import routes
from .api_get_flowsheet_route import GetFlowsheetRoute
from .api_get_react_app_route import GetReactAppRoute


class Router:
    def __init__(self, fastAPIApp, flowsheet, flowsheet_name):
        """Main router class use to call routes and pass params down to each route base on it needs
        Args:
            fastAPIApp: fastAPI app defined in parent class
            flowsheet: flowsheet object pass from fsvis -> FlowsheetApp
            flowsheet_name: the name of flowsheet pass from fsvis -> FlowsheetApp
        """
        # api end point get flowsheet
        GetFlowsheetRoute(fastAPIApp, flowsheet, flowsheet_name)

        # api end point serve react app
        # static router has to defined at end
        GetReactAppRoute(fastAPIApp)
