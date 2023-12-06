import os
import socket
import pickle
import json
import requests
import time
import threading

from idaes_ui.fv.models.flowsheet import merge_flowsheets
from idaes_ui.fv.flowsheet import FlowsheetSerializer

# FastAPI App
from idaes_ui.fv.app import FlowsheetApp


class ServerManager:
    def __init__(self, flowsheet, flowsheet_name, port):
        # flowsheet related
        self.flowsheet = flowsheet
        self.flowsheet_name = flowsheet_name
        # check if user named a port or start to pick an available port start from 8000
        if port:
            self.port = self.port_usage_check(port)
        else:
            self.port = self.port_usage_check(8000)

        # server related
        self.running = False

        # call functions
        # self.run_flowsheet_monitor(self.flowsheet, self.flowsheet_name, self.port)
        self.check_running_servers_file_exist()
        self.update_running_server_file()

    def check_running_servers_file_exist(self):
        """Use to check the file running_server.pickle exist or not
        if not exist create one
        """
        has_file = os.path.exists("./running_server.pickle")
        if not has_file:
            with open("running_server.pickle", "wb") as file:
                pickle.dump({}, file)

    def update_running_server_file(self):
        """Check curren running server existing in running_server.pickle or not
        if not exist: means this server never been start before, we use self.flowsheet_name
        and self.port create a dict write into running_server.pickle
        if exist: means user call visualize with same name again then we use flowsheet, flowsheet_name and port
        as param create a put req againest /api/put_fs to update flowsheet

        Returns:
            Void
        """
        # Initialize running_servers as an empty dictionary
        running_servers = {}

        # read from file pass read content to running_servers variable return dict with {"server_name": {"name":"somename", "port":"running_port"}}
        with open("running_server.pickle", "rb") as file:
            running_servers = pickle.load(file)

        # check current flowsheet name existing in running_servers
        is_current_server_down = False

        if self.flowsheet_name in running_servers:
            # check if this server is running or not, if down will return True to is_current_server_down
            is_current_server_down = self.check_server_status(
                port=self.port, flowsheet_name=self.flowsheet_name
            )

            # when server is up, call visualize, update flowsheet
            if not is_current_server_down:
                self.update_flowsheet(
                    port=self.port,
                    flowsheet=self.flowsheet,
                    flowsheet_name=self.flowsheet_name,
                )

            # exist, call put to update fs

        if self.flowsheet_name not in running_servers or is_current_server_down:
            # check current flowsheet name not exist in running_servers,
            # add new dict to running_servers_file base on this flowsheet name run a uvicorn server
            """
            dict format:
            self.flowsheet_name : {
                "name" : self.flowsheet_name,
                "port" : self.port
            }
            """
            print("no server, adding... then running new uvicorn")
            # edit current_running_server obj
            current_running_server = {
                "name": self.flowsheet_name,
                "port": self.port,
            }

            # assign self api_url
            port = current_running_server["port"]
            self.api_url = f"http://127.0.0.1:{port}/api/"

            # read_exist_running_server from running_server.pickle
            exist_running_servers = {}
            with open("running_server.pickle", "rb") as file:
                exist_running_servers = pickle.load(file)

            # because self.flowsheet_name not in running_servers, so add curent_running_server to running_server file
            exist_running_servers[self.flowsheet_name] = current_running_server

            # write new exist_running_servers to file: running_server.pickle
            with open("running_server.pickle", "wb") as file:
                pickle.dump(exist_running_servers, file)

            # run fastAPI app
            FlowsheetApp(
                flowsheet=self.flowsheet,
                name=self.flowsheet_name,
                port=self.port,
            )

            self.running = True

            try:
                print("Entering try block")
                time.sleep(2)
                print("making put req from python !!!!!!!!")
                ###############################
                # test area
                headers = {"Content-Type": "application/json"}
                # new_flowsheet = Flowsheet(self.flowsheet)
                new_flowsheet = FlowsheetSerializer(
                    self.flowsheet, self.flowsheet_name, False
                ).as_dict()
                json_req_body = {
                    "flowsheet_type": "jjs_fs",
                    "flowsheet": new_flowsheet,
                }

                res = requests.put(
                    f"http://127.0.0.1:{self.port}/api/put_fs",
                    data=json.dumps(json_req_body),
                    headers=headers,
                )
                print("$$$$$$")
                print(res)
                print("$$$$$$")
                print("making put req from python done !!!!!!!!")
                ###############################

                # url = f"http://127.0.0.1:{self.port}/api/post_health_check"
                # headers = {"Content-Type": "application/json"}
                # while self.running:
                #     time.sleep(1)
                #     print("running...")
                #     health_check_res = requests.post(
                #         url, data=json.dumps({"server_alive_check": 1}), headers=headers
                #     )
                #     if not health_check_res:
                #         self.remove_current_running_server_from_file(
                #             self.flowsheet_name
                #         )

                print(f"server is running with uvicorn on port {self.port}")
            except KeyboardInterrupt:
                self.running = False
                print("____________________")
                print("Exist UI server...")
                print("Remove current server out of running_server.pickle")
                self.remove_current_running_server_from_file(self.flowsheet_name)
                print("Server removed from running_server.pickle")
                print("____________________")

    def check_server_status(self, port, flowsheet_name):
        """Check if server is running on port
        if not running on port remove this server base on flowsheet_name from running_server.pickle
        Args:
            port: self.port
            flowsheet_name: self.flowsheet_name
        """
        health_check_url = f"http://127.0.0.1:{port}/api/post_health_check"
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(
                health_check_url,
                data=json.dumps({"server_alive_check": 1}),
                headers=headers,
            )
            print(response)
            return False
        except requests.exceptions.ConnectionError:
            self.remove_current_running_server_from_file(flowsheet_name)
            return True

    def update_flowsheet(self, port, flowsheet, flowsheet_name):
        """Check if server is running on port
        if not running on port remove this server base on flowsheet_name from running_server.pickle
        Args:
            port: self.port
            flowsheet_name: self.flowsheet_name
        """
        update_flowsheet_url = f"http://127.0.0.1:{port}/api/put_fs"
        headers = {"Content-Type": "application/json"}

        try:
            # dump flowsheet to dict
            new_flowsheet = FlowsheetSerializer(
                flowsheet, flowsheet_name, False
            ).as_dict()
            # build request body
            req_body = {
                "flowsheet_type": "jjs_fs",
                "flowsheet": new_flowsheet,
            }
            # api call
            res = requests.put(
                update_flowsheet_url,
                data=json.dumps(req_body),
                headers=headers,
            )
        except requests.exceptions:
            print("error")

    def remove_current_running_server_from_file(self, flowsheet_name):
        """Removes the specified flowsheet server from the 'running_server.pickle' file.

        This function is called when the server is stopped, either by a 'Control+C' command or when a health check to
        '/api/post_health_check' endpoint does not receive a response, indicating that the server has already stopped.

        Removing the flowsheet server from the file ensures that the next time the UI application is launched, it correctly
        identifies that this particular flowsheet server is not running.

        Args:
            flowsheet_name (str): The name of the flowsheet whose server needs to be removed from the tracking file.
        """
        running_server = {}
        # read from running_servers.pickle write to running_servers
        with open("running_server.pickle", "rb") as file:
            running_server = pickle.load(file)

        # base on flowsheet_name remove item name = flowsheet_name
        running_server.pop(flowsheet_name, None)

        # write modified running_servers back to running_server.pickle
        with open("running_server.pickle", "wb") as file:
            pickle.dump(running_server, file)

        print(
            f"server on port: {self.port} is stoped, running server: {self.flowsheet_name} is removed from running_server.pickle"
        )

    # empty pickle file
    # import pickle

    # with open("./running_server.pickle", "wb") as file:
    #     pickle.dump({}, file)
    # with open("./running_server.pickle", "rb") as file:
    #     print(pickle.load(file))

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
