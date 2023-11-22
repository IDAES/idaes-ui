from idaes_ui.fv.models.flowsheet import Flowsheet


class FlowsheetManager:
    """Use to manage flowsheet, use as a universal container can allow different class call its getter ans setter to update and read new flowsheet"""

    def __init__(self, flowsheet, flowsheet_name):
        """init assign define slef's
        Args:
            flowsheet: the flowsheet pass eather from fsvis -> FlowsheetApp -> Router
        """
        self.flowsheet_name = flowsheet_name
        self.original_flowsheet = flowsheet
        self.jjs_flowsheet = Flowsheet(flowsheet)

    def get_original_flowsheet(self):
        return self.original_flowsheet

    def update_original_flowsheet(self, new_original_flowsheet):
        self.original_flowsheet = new_original_flowsheet
        self.jjs_flowsheet = Flowsheet(new_original_flowsheet)

    def get_jjs_flowsheet(self) -> Flowsheet:
        """Return most recent flowsheet use in joint js
        Returns: flowsheet
        """
        return self.jjs_flowsheet

    def update_jjs_flowsheet(self, frontend_put_jjs_flowsheet):
        """Update self flowsheet to user saved flowsheet use in joint js
        Args:
            frontend_put_jjs_flowsheet: the flowsheet user saved and passed from api/put_fs
        """
        self.jjs_flowsheet = frontend_put_jjs_flowsheet

    def get_flowsheet_name(self):
        print(self.flowsheet_name)
        return self.flowsheet_name
