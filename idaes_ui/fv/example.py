"""
Simple example for Flowsheet Visualizer (FV).

To change logging level, set the FV_LOG_LEVEL environment variable
to a numeric or string value that matches one of the standard Python logging levels.
"""

__author__ = "Dan Gunter"

# stdlib
import argparse
import logging
import os
import time

# idaes
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet
from idaes_ui.fv import visualize

# Logging setup
logging.basicConfig()
_log = logging.getLogger()
_log.handlers[0].setFormatter(logging.Formatter("%(asctime)s %(message)s"))
_log.setLevel(logging.INFO)


def fv_example(**vis_kw):
    m = build_flowsheet()
    visualize(m.fs, "sample_visualization", port=49999, **vis_kw)
    _log.info("Starting Flowsheet Visualizer")
    _log.info("Press Control-C to stop")
    try:
        while 1:
            time.sleep(1)
    except KeyboardInterrupt:
        _log.info("Flowsheet Visualizer stopped")
    return 0


level_map = {
    logging.getLevelName(n): n
    for n in (logging.DEBUG, logging.INFO, logging.WARN, logging.ERROR)
}


def parse_logging_level(s: str, level: int) -> int:
    try:
        n = int(s)
    except ValueError:
        n = level_map.get(s.upper(), level)
    return n


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--headless", action="store_true")
    args = p.parse_args()

    log_level_raw = os.environ.get("FV_LOG_LEVEL", "error")
    log_level = parse_logging_level(log_level_raw, logging.ERROR)
    logging.getLogger("idaes_ui").setLevel(log_level)
    _log.info("Start: Flowsheet Visualizer example")
    fv_example(browser=not args.headless)
    _log.info("Finished: Flowsheet Visualizer example")


if __name__ == "__main__":
    main()
