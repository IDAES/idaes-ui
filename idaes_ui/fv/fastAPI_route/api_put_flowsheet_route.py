class PutFlowsheetRoute:
    def __init__(self, fastAPIApp):
        @fastAPIApp.put("/api/put_fs", tags=["Flowsheet"])
        def put_flowsheet(updatedFlowsheet, oldFlowsheet):
            return {"message": "put flowsheet is workiung"}
