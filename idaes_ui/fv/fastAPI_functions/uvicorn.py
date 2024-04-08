"""
Define how to use uvicorn to serve fastAPI app
"""
import sys
import asyncio
import uvicorn
import webbrowser
from threading import Thread
import time
import pickle


class WebUvicorn:
    def __init__(self, fastAPIApp, port, flowsheet_name):
        self.flowsheet_name = flowsheet_name
        self.app = fastAPIApp
        self.port = port
        # run uvicorn serve web app
        self.run()

    async def serve(self):
        """Setup uvicorn serve with async

        Args:
            port: the port FastAPI app running on.

        Returns:
            server: configed uvicorn server
        """
        # Get available port
        self.port = self.port
        # setup uvicorn config
        config = uvicorn.Config(
            self.app, host="127.0.0.1", port=self.port  # loop="asyncio"
        )
        server = uvicorn.Server(config)
        await server.serve()
        return server

    def run_server_async(self):
        """Run FastAPI server with uvicorn, also call open browser but delay 1.5s

        Args:
            port: the port FastAPI app running on.
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.serve())

    def open_browser(self):
        """When FastAPI run, open browser on localhost with port.

        Args:
            port: the port FastAPI app running on, will open browser window with this port.
        """
        url = f"http://127.0.0.1:{self.port}?id={self.flowsheet_name}"
        webbrowser.open(url)

    def clean_up(self):
        """when this flowsheet server stopped, we should clean up running_server.pickle remove this flowsheet from
        running_server.pickle

        when uvicorn stopped port will be auto release
        """
        print("Stoping server, clean up running_server.pickle")
        pickle_file_path = "running_server.pickle"

        # open running_server.pickle and delete this flowsheet base on self.flowsheet_name
        with open(pickle_file_path, "rb") as file:
            running_server_list = pickle.load(file)
            del running_server_list[self.flowsheet_name]

        # write rest of running servers back to the running_server.pickle
        with open(pickle_file_path, "wb") as file:
            pickle.dump(running_server_list, file)
            print(running_server_list)

    def run(self):
        try:
            # start server, if want stop async just add daemon=True after target=self.run_server_async
            Thread(target=self.run_server_async).start()
            time.sleep(1)  # give system 1 second to start server the open browser
            Thread(target=self.open_browser).start()  # start browser

            # TODO find a better way to capture the keyboardInterrupt not use while loop
            # while loop use to block thread to allow except to capture keyboardInterrupt
            # while True:
            #     time.sleep(5)
        except KeyboardInterrupt:
            self.clean_up()
            sys.exit(0)
