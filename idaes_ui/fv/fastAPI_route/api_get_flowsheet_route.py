import os

from idaes_ui.fv.models.flowsheet import Flowsheet


class GetFlowsheetRoute:
    def __init__(self, fastAPIApp, flowsheet, flowsheet_name, save_dir):
        @fastAPIApp.get("/api/get_fs", tags=["Flowsheet"])
        def get_flowsheet() -> Flowsheet:
            # check if save_dir already has flowsheet file
            has_file = self.file_exists(save_dir, flowsheet_name)

            # when find saved flowsheet file:
            if has_file:
                print("finded")

            # when not saved find flowsheet file
            if not has_file:
                self.flowsheet = Flowsheet(flowsheet)
            # todo: check 1st time for saved one (merge if found)
            return self.flowsheet

    def file_exists(self, file_path, file_name):
        """To check if a spcific file is exist in the file path
        Args:
            file_path: save_dir
            file_name: flowsheet_name + .json
        """
        full_path = os.path.join(file_path, file_name + ".json")
        print(full_path)
        print(os.path.isfile(full_path))
        return os.path.isfile(full_path)
