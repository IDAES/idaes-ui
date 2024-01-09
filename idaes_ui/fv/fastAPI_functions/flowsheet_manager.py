import json
from idaes_ui.fv.models.flowsheet import Flowsheet
from idaes_ui.fv.flowsheet import FlowsheetSerializer
from idaes_ui.fv.models.flowsheet import merge_flowsheets
from idaes_ui.fv.flowsheet import FlowsheetDiff
import time
from threading import Thread


class FlowsheetManager:
    """Use to manage flowsheet, use as a universal container can allow different class call its getter ans setter to update and read new flowsheet"""

    def __init__(self, flowsheet, flowsheet_name, save_time_interval):
        """init assign define slef's
        Args:
            flowsheet: the flowsheet pass eather from fsvis -> FlowsheetApp -> Router
        """
        self.flowsheet_name = flowsheet_name
        self.flowsheet = flowsheet
        self.updated_fs = None
        self.front_end_jjs_flowsheet = None
        self.save_time_interval = save_time_interval

    def get_flowsheet_name(self):
        return self.flowsheet_name

    def get_original_flowsheet(self):
        return self.flowsheet

    def update_original_flowsheet(self, new_original_flowsheet):
        print("update")
        # TODO eather update this or remove it check all route use this fn
        # self.original_flowsheet = new_original_flowsheet
        # self.jjs_flowsheet = Flowsheet(new_original_flowsheet)

    def get_jjs_flowsheet(self):
        """Return return populated JJS flowsheet depends on if user has modified the flowsheet
        Returns: flowsheet
        """
        if self.updated_fs:
            old_fs = FlowsheetSerializer(
                self.flowsheet, self.flowsheet_name, True
            ).as_dict()

            new_fs = self.front_end_jjs_flowsheet

            updated_fs = merge_flowsheets(old_fs, new_fs)
            self.updated_fs = updated_fs
            return self.updated_fs
        else:
            # jjs_fs = Flowsheet(self.flowsheet)
            jjs_fs = FlowsheetSerializer(
                self.flowsheet, self.flowsheet_name, True
            ).as_dict()
            return jjs_fs

    def update_jjs_flowsheet(self, frontend_put_jjs_flowsheet):
        """Update self flowsheet to user saved flowsheet use in joint js
        Args:
            frontend_put_jjs_flowsheet: the flowsheet user saved and passed from api/put_fs
        """
        self.front_end_jjs_flowsheet = frontend_put_jjs_flowsheet
        old_fs = FlowsheetSerializer(
            self.flowsheet, self.flowsheet_name, True
        ).as_dict()
        updated_fs = merge_flowsheets(old_fs, frontend_put_jjs_flowsheet)
        self.updated_fs = updated_fs
        return updated_fs

    # App settings
    def get_save_time_interval(self):
        """reading current save time interval"""
        return self.save_time_interval

    def update_save_time_interval(self, new_save_time_interval: int):
        """update current save time interval
        Args:
            new_save_time_interval: int, the value of new auto save time
        """
        self.save_time_interval = new_save_time_interval
