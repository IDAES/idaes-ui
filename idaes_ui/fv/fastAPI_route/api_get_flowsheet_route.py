import os
import json

from idaes_ui.fv.models.flowsheet import Flowsheet


class GetFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet_manager, flowsheet_name, save_dir):
        @fastAPIApp.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet() -> Flowsheet:
            flowsheet = flowsheet_manager.get_flowsheet()
            return flowsheet

            # TODO: do we want to save file on user's input save_path? or everything happens in memary only?
            # # check if save_dir already has flowsheet file
            # has_file = self.file_exists(save_dir, flowsheet_name)

            # # when find saved flowsheet file:
            # if has_file:
            #     print(
            #         f"Flowsheet file named as {flowsheet_name} is existing on path {save_dir}, will serve this file with your default browser, or you can rename your flowsheet"
            #     )
            #     return self.return_exist_flowsheet(save_dir, flowsheet_name)

            # # when not saved find flowsheet file
            # if not has_file:
            #     self.flowsheet = Flowsheet(flowsheet)
            #     # todo: check 1st time for saved one (merge if found)
            #     print(
            #         f"New Flowsheet file named {flowsheet_name} created at: {save_dir}"
            #     )
            #     return self.flowsheet

    # def file_exists(self, file_path, file_name):
    #     """To check if a spcific file is exist in the file path
    #     Args:
    #         file_path: save_dir
    #         file_name: flowsheet_name + .json
    #     """
    #     full_path = os.path.join(file_path, file_name + ".json")
    #     print(
    #         f"Flowsheet file named as {flowsheet_name} is existing on path {save_dir}, will serve this file with your default browser, or you can rename your flowsheet"
    #     )
    #     return os.path.isfile(full_path)

    # def return_exist_flowsheet(file_path, file_name):
    #     """when user already save a flowsheet, we return that
    #     Returns: the content of existing flowsheet file
    #     """
    #     try:
    #         with open(file_path + file_name + ".json", "r", encoding="utf-8") as file:
    #             # load JSON content from the existing file
    #             data = json.load(file)
    #             return data
    #     except FileNotFoundError:
    #         print(f"The file {file_path} was not found.")
    #     except json.JSONDecodeError:
    #         print(f"Error decoding JSON from file {file_path}.")
