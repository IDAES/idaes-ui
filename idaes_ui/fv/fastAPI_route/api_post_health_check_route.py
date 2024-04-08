import os
import asyncio
from pydantic import BaseModel


class HealthStatus(BaseModel):
    server_alive_check: int


class PostHealthCheck:
    def __init__(self, fastAPIApp):
        @fastAPIApp.post("/api/post_health_check")
        def health_check(req_body: HealthStatus):
            # asyncio.create_task(self.stop_uvicorn_if_no_heartbeat())
            return True

    # TODO: health check every 2 seconds front end will send a requst to present its tab is on if over 10 if over 10 seconds didn't receive that signal will turn that spcific uvicorn servic off
    # async def stop_uvicorn_if_no_heartbeat():
    #     while True:
    #         print("10 seconds")
    #         await asyncio.sleep(10)
