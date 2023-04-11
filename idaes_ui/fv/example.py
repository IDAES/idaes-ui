"""
Simple example for Flowsheet Visualizer (FV).

To change logging level, set the FV_LOG_LEVEL environment variable
to a numeric or string value that matches one of the standard Python logging levels.
"""
__author__ = "Dan Gunter"

# stdlib
import logging
import os
from pathlib import Path
import time

# idaes
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet
from idaes_ui.fv import visualize

# Logging setup
logging.basicConfig()
_log = logging.getLogger()
_log.handlers[0].setFormatter(logging.Formatter("%(asctime)s %(message)s"))
_log.setLevel(logging.INFO)


class StopFile:
    def __init__(self):
        filename = f"stop_fv_example.txt"
        self._path = Path(filename)
        with self._path.open("w") as f:
            f.write("RUN\n")
            f.write("Change word above to 'stop' to stop the example\n")

    def stopped(self) -> bool:
        line = ""
        try:
            with self._path.open("r") as f:
                line = f.readline()
        except IOError:
            pass
        return line.lower().strip() == "stop"


def fv_example(headless):
    sf = StopFile()
    m = build_flowsheet()
    port = 49000  # fix port for testing
    visualize(m.fs, "sample_visualization", port=port, browser=not headless)
    _log.info("Starting Flowsheet Visualizer")
    _log.info("Press Control-C to stop")
    try:
        while 1:
            time.sleep(1)
            if sf.stopped():
                break
    except KeyboardInterrupt:
        _log.info("Flowsheet Visualizer stopped")
    return 0


level_map = {logging.getLevelName(n): n for n in (logging.DEBUG, logging.INFO,
                                                  logging.WARN, logging.ERROR)}


def parse_logging_level(s: str, level: int) -> int:
    try:
        n = int(s)
    except ValueError:
        n = level_map.get(s.upper(), level)
    return n


def main():
    log_level_raw = os.environ.get("FV_LOG_LEVEL", "error")
    log_level = parse_logging_level(log_level_raw, logging.ERROR)
    logging.getLogger("idaes_ui").setLevel(log_level)

    headless_env = os.environ.get("FV_HEADLESS", "")
    headless = headless_env.lower() in ("yes", "true", "y", "1")
    if headless:
        _log.info("Running in headless mode")
    else:
        _log.info("Display interface in browser")

    _log.info("Start: Flowsheet Visualizer example")
    fv_example(headless)
    _log.info("Finished: Flowsheet Visualizer example")


if __name__ == "__main__":
    main()
