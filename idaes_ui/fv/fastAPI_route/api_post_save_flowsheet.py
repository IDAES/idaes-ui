import os
import json
import pathlib
import re

from pydantic import BaseModel
from idaes_ui.fv.fastAPI_functions.save_flowsheet import SaveFlowsheet
from idaes_ui.fv.flowsheet import FlowsheetSerializer


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
        self.flowsheet = flowsheet
        self.save = save
        self.flowsheet_name = flowsheet_name
        self.save_dir = save_dir
        self.load_from_saved = load_from_saved
        self.overwrite = overwrite

        @fastAPIApp.post("/api/post_save_flowsheet", tags=["Save Flowsheet"])
        def post_save_flowsheet(req_body: save_flowsheet_model):
            # return when save == False
            if type(self.save) == bool and self.save == False:
                return {"mesage": "No flowsheet is saved, because param save = False"}

            # TODO: check save params is valid
            if type(self.save) == "number":
                return {
                    "message": f"invalid save param, {self.save} is type {type(self.save)}",
                    "saved": False,
                }
            if self.save == "/no/such/file/exists.I.hope":
                print("omg it passed")
                return {
                    "message": f"invalid save param, {self.save} is type {type(self.save)}",
                    "saved": False,
                }

            # initial save_path
            save_path = None

            # check save is abs path or not
            save_is_abs = os.path.isabs(self.save)

            # populate save path and get save path
            # 1. when save is abs path
            if save_is_abs:
                save_path = self.save

            # 2. when save is not abs path
            if not save_is_abs:
                # in fsvis comment defined how to use save_dir when save is not abs path
                # define default save path as cwd/saved_flowsheet/
                cwd = pathlib.Path(os.getcwd()) / "saved_flowsheet"
                print(
                    f"Your param save: '{save}' is not a abs path, will use '{cwd}' as default saving location "
                )
                save_path = cwd

            # check save path exist or not
            # 1. when save path is not a dir, it maybe a path/filename.json
            if not save_path.is_dir():
                # get parent dir as save_path_parent
                save_path_parent = save_path.parent
                # check parent if not exist create one
                if not os.path.exists(save_path_parent):
                    save_path_parent.mkdir(parents=True, exist_ok=True)

            # 2. when save path is dir, check path exist or not then add file name and extension to this path
            if save_path.is_dir():
                # check if path not exist create path
                if not os.path.exists(save_path):
                    save_path.mkdir(parents=True, exist_ok=True)
                    # add file name and extension
                save_path = (
                    pathlib.Path(save_path)
                    / f"{flowsheet_manager.get_flowsheet_name()}.json"
                )

            # write to json
            # get current flowsheet
            current_flowsheet = FlowsheetSerializer(
                flowsheet_manager.get_original_flowsheet(),
                f"{self.flowsheet_name}",
                True,
            ).as_dict()
            # when overwrite is True directly over write saved flowsheet
            if self.overwrite:
                with open(save_path, "w") as file:
                    data = json.dump(current_flowsheet, file)

            if not self.overwrite:
                # 1. check save path flowsheetName.json file exist or not
                # if not exist directly write file with the save_path
                # if exist read max version number and + 1 as current version number then write to file

                if not save_path.exists():
                    with open(save_path, "w") as file:
                        data = json.dump(current_flowsheet, file)
                        print(
                            f"Successfully saved flowsheet: '{self.flowsheet_name}' to location: {save_path}"
                        )

                else:
                    # create regex pattern use to read file version numbers
                    pattern = re.compile(
                        rf"{re.escape(self.flowsheet_name)}-(\d+)\.json$"
                    )

                    # base on version number create array versions
                    versions = [
                        int(match.group(1))
                        for file in save_path.parent.iterdir()
                        if (match := pattern.match(file.name))
                    ]

                    # assign version number to saved file
                    if versions:
                        # get latest version of saved use to build file path to compare with current_flowsheet
                        latest_version = max(versions)
                        # when file with same flowsheet_name and has version number, add current_version is largest number + 1
                        current_version = max(versions) + 1
                    else:
                        # when no version number latest should be empty
                        latest_version = ""
                        # when no version number spcified current_version = 1
                        current_version = 1

                    # read latest saved flowsheet
                    version_number = (
                        "" if latest_version == "" else f"-{latest_version}"
                    )
                    latest_path = (
                        save_path.parent / f"{self.flowsheet_name}{version_number}.json"
                    )

                    # read latest saved flowsheet use to compare with current_flowsheet
                    with open(latest_path, "r") as file:
                        latest_saved_flowsheet = json.load(file)

                    # check if latest flowsheet is different with current flowsheet if same return, if different write in file and save
                    if current_flowsheet == latest_saved_flowsheet:
                        print("Nothing is changed, no need to save flowsheet")
                        return
                    else:
                        new_saved_flowsheet_file_name = (
                            f"{self.flowsheet_name}-{current_version}.json"
                        )

                        save_path = save_path.parent / new_saved_flowsheet_file_name

                        with open(save_path, "w") as file:
                            data = json.dump(current_flowsheet, file)
                            print(
                                f"Successfully saved flowsheet: '{new_saved_flowsheet_file_name}' to location: {save_path}"
                            )
