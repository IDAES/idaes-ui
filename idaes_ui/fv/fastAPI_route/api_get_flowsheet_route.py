import os
import json
from fastapi import Query

from idaes_ui.fv.models.flowsheet import Flowsheet


class GetFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet_manager, flowsheet_name, save_dir):
        @fastAPIApp.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet(get_which: str = Query(...)):
            jjs_flowsheet = flowsheet_manager.get_jjs_flowsheet()
            flowsheet_name = flowsheet_manager.get_flowsheet_name()

            if get_which == "flowsheet":
                return jjs_flowsheet
            if get_which == "flowsheetName":
                return flowsheet_name
