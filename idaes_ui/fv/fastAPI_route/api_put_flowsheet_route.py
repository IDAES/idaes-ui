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

    fs_name: str
    fs: Flowsheet


class PutFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet_manager, save_dir):
        @fastAPIApp.put("/api/put_fs", tags=["Save Flowsheet"])
        def put_flowsheet(req_body: PutFlowsheetReqModel):
            """PUT request use to receive updated flowsheet, compare with stored flowsheet, if find change, update the stored one.
            Args:
                req_body : the new flowsheet pass from fronend
            returns:
                updated flowsheet
            """
            print("Recetive request from /api/put_fs......")

            # check request body
            if not req_body.fs_name or not req_body.fs:
                return {
                    "error": "please check you missing body params, corrent format\{fs_name:'flowsheet name', fs:flowsheet\}"
                }

            # read user's saved flowsheet from frontend
            flowsheet = req_body.fs

            # update flowsheet through flowsheet manager
            flowsheet_manager.update_flowsheet(flowsheet)

            # TODO: remove this return, a put req need to return or on frontend make another call
            return {"message": "flowsheet uptodate"}
