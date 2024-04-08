import os
import socket
import pickle
import json
import requests
import time
from pathlib import Path
from typing import Optional, Union, Dict, Tuple

from idaes_ui.fv.models.flowsheet import merge_flowsheets
from idaes_ui.fv.flowsheet import FlowsheetSerializer

# FastAPI App
from idaes_ui.fv.app import FlowsheetApp


class ServerManager:
    def __init__(
        self,
        flowsheet,
        flowsheet_name: str,
        port: int,
        save_time_interval: int,
        save: Optional[Union[Path, str, bool]] = None,
        save_dir: Optional[str] = None,
        load_from_saved: Optional[bool] = True,
        overwrite: Optional[bool] = False,
        test: bool = False,
        browser: bool = True,
    ):
        # flowsheet related
        self.flowsheet = flowsheet
        self.flowsheet_name = flowsheet_name
        self.save_time_interval = (save_time_interval,)
        self.save = save
        self.save_dir = save_dir
        self.load_from_saved = load_from_saved
        self.overwrite = overwrite
        self.test = test
        self.browser = browser

        # check if user named a port or start to pick an available port start from 8000
        if port:
            self.port = self.port_usage_check(port)
        else:
            self.port = self.port_usage_check(8000)

        # use to store fastapi app
        self.flowsheet_class_instence = None
        self.fastapi_app = None

        # server related
        # default asume the server is down, will be check and update in self.update_running_server_file()
        self.is_current_server_down = True

        # initial save
        self.check_running_servers_file_exist()
        self.update_running_server_file()

        # start fastapi server only if is_current_server_down is True
        # is_current_server_down value assign in self.update_running_server_file()
        if self.is_current_server_down:
            self.start_fastapi()

    def check_running_servers_file_exist(self):
        """Use to check the file running_server.pickle exist or not
        if not exist create one.

        The running_server.pickle file use to store list of running server
        """
        has_file = os.path.exists("./running_server.pickle")
        if not has_file:
            with open("running_server.pickle", "wb") as file:
                pickle.dump({}, file)

    def update_running_server_file(self, flowsheet_name: Optional[str] = None):
        """Check current running server existing in running_server.pickle or not
        if not exist: means this server never been start before or deleted when server shutdown,
        we use self.flowsheet_name and self.port create a dict write into running_server.pickle.

        if exist: means user call visualize with same name again then we use flowsheet, flowsheet is in memary, it will auto update

        Args:
            self: server_manager instence self
            flowsheet_name:Optional string of flowsheet name, use to remove server from the running_server.pickle
        Returns:
            Void
        """
        # read from file pass read content to running_servers variable return dict with
        # data structure -> {"server_name": {"name":"somename", "port":"running_port"}}
        with open("running_server.pickle", "rb") as file:
            running_servers = pickle.load(file)

        # check current flowsheet name existing in running_servers
        # is_current_server_down == True, self.flowsheet_name not in running_server list, vice versa.
        self.is_current_server_down = self.flowsheet_name not in running_servers

        # when is_current_server_down:
        if self.is_current_server_down:
            """when server is not in list we do:
            1. write this server into running_server.pickle
                    Format: "self.flowsheet_name": {name: self.flowsheet_name, port: self.port}
            2. start server with call FlowsheetApp(args...)
            """
            # 1. write this server into running_server.pickle
            # read from pickle get running_server_list
            # read server list from running_server.pickle and add current server to the list as running_servers
            with open("running_server.pickle", "rb") as file:
                running_servers = pickle.load(file)
                new_server = {
                    "name": self.flowsheet_name,
                    "port": self.port,
                }
                running_servers[f"{self.flowsheet_name}"] = new_server

            # write running_servers to running_server.pickle
            with open("running_server.pickle", "wb") as writeToFile:
                pickle.dump(running_servers, writeToFile)

    def start_fastapi(self):
        """when self.is_current_server_down this fn will be called and start a new fastapi instence
        and assign fastapi instence to self.fastapi_app use for Testclient to test
        return:
            Void
        """
        self.flowsheet_class_instence = FlowsheetApp(
            flowsheet=self.flowsheet,
            name=self.flowsheet_name,
            port=self.port,
            save_time_interval=self.save_time_interval,
            save=self.save,
            save_dir=self.save_dir,
            load_from_saved=self.load_from_saved,
            overwrite=self.overwrite,
            test=self.test,
            browser=self.browser,
        )

        # read fastapi app from flowsheet instence assign to self.fastapi_app
        self.fastapi_app = self.flowsheet_class_instence.get_fast_api_app()

    def port_usage_check(self, port):
        """use for port check, if pass in port is in use, then modifiy port number + 1 until port available
        Args:
            port: the port use to pass in by user or default 8000
        Returns:
            port: the modified port number (available port number)
        """

        while True:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(("127.0.0.1", port))
                    return port
                except OSError:
                    port += 1
