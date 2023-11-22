"""
Define how to use uvicorn to serve fastAPI app
"""

import sys
import socket
import asyncio
import uvicorn
import webbrowser
import threading
from threading import Thread
import time


class WebUvicorn:
    def __init__(self, fastAPIApp, port, flowsheet_name):
        self.flowsheet_name = flowsheet_name
        self.app = fastAPIApp
        self.port = self.port_usage_check(port)
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
        self.port = self.port_usage_check(self.port)
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

    def run(self):
        # start server, if want stop async just add daemon=True after target=self.run_server_async
        Thread(target=self.run_server_async).start()
        time.sleep(1)  # give system 1 second to start server the open browser
        Thread(target=self.open_browser).start()  # start browser

    def port_usage_check(self, port):
        """use for port check, if pass in port is in use then modifiy port number + 1 until port available
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
