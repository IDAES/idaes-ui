"""
Define how to use uvicorn to serve fastAPI app
"""

import asyncio
import uvicorn
import webbrowser
from threading import Thread
import time


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

    def run(self):
        # start server, if want stop async just add daemon=True after target=self.run_server_async
        Thread(target=self.run_server_async).start()
        time.sleep(1)  # give system 1 second to start server the open browser
        Thread(target=self.open_browser).start()  # start browser
