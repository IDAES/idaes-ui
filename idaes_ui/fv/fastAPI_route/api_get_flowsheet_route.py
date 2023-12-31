import os
import json
from fastapi import Query

from idaes_ui.fv.models.flowsheet import Flowsheet


class GetFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet_manager, flowsheet_name, save_dir):
        @fastAPIApp.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet(get_which: str = Query(...)):
            if get_which == "flowsheet":
                jjs_flowsheet = flowsheet_manager.get_jjs_flowsheet()
                return jjs_flowsheet

            if get_which == "flowsheetName":
                flowsheet_name = flowsheet_manager.get_flowsheet_name()
                return flowsheet_name

            if get_which == "original_flowsheet":
                original_flowsheet = flowsheet_manager.get_original_flowsheet()
                return original_flowsheet
