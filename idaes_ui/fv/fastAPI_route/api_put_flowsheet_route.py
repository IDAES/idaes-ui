from pydantic import BaseModel


class PutFlowsheetRoute(BaseModel):
    updateFlowsheet: str
    oldFlowsheet: str

    def __init__(self, fastAPIApp):
        print("until here is working")

        @fastAPIApp.put("/api/put_fs", tags=["Save Flowsheet"])
        def put_flowsheet(flowsheet_data):
            updated_flowsheet = flowsheet_data.updatedFlowsheet
            old_flowsheet = flowsheet_data.oldFlowsheet
            return {"message": updated_flowsheet}
