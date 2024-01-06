from pydantic import BaseModel
from idaes_ui.fv.fastAPI_functions.save_flowsheet import SaveFlowsheet


class save_flowsheet_model(BaseModel):
    save_flowsheet: bool


class PostSaveFlowsheet:
    def __init__(
        self,
        fastAPIApp,
        flowsheet_manager,
        flowsheet,
        flowsheet_name,
        save,
        save_dir,
        load_from_saved,
        overwrite,
    ):
        @fastAPIApp.post("/api/post_save_flowsheet", tags=["Save Flowsheet"])
        def post_save_flowsheet(req_body: save_flowsheet_model):
            # get flowsheet name from flowsheet manager
            var_flowsheet = flowsheet
            var_flowsheet_name = flowsheet_name
            # initial save flowsheet class
            save_flowsheet = SaveFlowsheet(
                flowsheet_name=var_flowsheet_name,
                flowsheet=var_flowsheet,
                save=save,
                save_dir=save_dir,
                load_from_saved=load_from_saved,
                overwrite=overwrite,
            )
            save_result = save_flowsheet.save_handler()
            return save_result
