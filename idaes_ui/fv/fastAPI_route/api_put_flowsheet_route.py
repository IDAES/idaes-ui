import json
from typing import Any
from pydantic import BaseModel

from idaes_ui.fv.models.flowsheet import Flowsheet


class PutFlowsheetReqModel(BaseModel):
    """Define PUT request model
    Args:
        BaseModel: pydantic BaseModel
    Body_Params:
        fs_name: string, the name of flowsheet
        fs: Flowsheet Object, pass from frontend
    """

    flowsheet_type: str  # original and jjs_fs
    flowsheet: Any  # flowsheet


class PutFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet_manager, save_dir):
        @fastAPIApp.put("/api/put_fs", tags=["Update Flowsheet"])
        def put_flowsheet(req_body: PutFlowsheetReqModel):
            """PUT request use to receive updated flowsheet, compare with stored flowsheet, if find change, update the stored one.
            Args:
                req_body : the new flowsheet pass from fronend
            returns:
                updated flowsheet
            """
            # update joint js flowsheet
            if req_body.flowsheet_type == "jjs_fs":
                update_flowsheet = flowsheet_manager.update_jjs_flowsheet(
                    req_body.flowsheet
                )

                return {
                    "message": "successfully update joint js flowsheet",
                    "flowsheet": update_flowsheet,
                }

            # update original flowsheet
            if req_body.flowsheet_type == "original":
                flowsheet_manager.update_original_flowsheet(req_body.flowsheet)
                return {"message": "successfully update original flowsheet"}
