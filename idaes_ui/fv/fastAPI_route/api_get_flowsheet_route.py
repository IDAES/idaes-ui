from idaes_ui.fv.models.flowsheet import Flowsheet


class GetFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet, flowsheet_name):
        @fastAPIApp.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet() -> Flowsheet:
            self.flowsheet = Flowsheet(flowsheet)
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet
