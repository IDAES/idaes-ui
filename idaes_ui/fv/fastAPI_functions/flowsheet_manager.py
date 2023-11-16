from idaes_ui.fv.models.flowsheet import Flowsheet


class FlowsheetManager:
    """Use to manage flowsheet, use as a universal container can allow different class call its getter ans setter to update and read new flowsheet"""

    def __init__(self, flowsheet):
        """init assign self flowsheet = flowsheet
        Args:
            flowsheet: the flowsheet pass eather from fsvis -> FlowsheetApp -> Router
        """
        self.flowsheet = Flowsheet(flowsheet)

    def get_flowsheet(self) -> Flowsheet:
        """Return most recent flowsheet
        Returns: flowsheet
        """
        return self.flowsheet

    def update_flowsheet(self, new_flowsheet):
        """Update self flowsheet to user saved flowsheet
        Args:
            new_flowsheet: the flowsheet user saved and passed from api/put_fs
        """
        self.flowsheet = new_flowsheet
