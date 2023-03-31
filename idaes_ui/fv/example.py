"""
Simple example for Flowsheet Visualizer (FV).
"""
__author__ = "Dan Gunter"

# stdlib
import logging
import time

# idaes
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet
from idaes_ui.fv import visualize

# Logging setup
logging.basicConfig()
_log = logging.getLogger()
_log.handlers[0].setFormatter(logging.Formatter("%(asctime)s %(message)s"))
_log.setLevel(logging.INFO)


def fv_example():
    m = build_flowsheet()
    visualize(m.fs, "sample_visualization")
    _log.info("Starting Flowsheet Visualizer")
    _log.info("Press Control-C to stop")
    try:
        while 1:
            time.sleep(1)
    except KeyboardInterrupt:
        _log.info("Flowsheet Visualizer stopped")
    return 0


def main():
    logging.getLogger("idaes").setLevel(logging.ERROR)
    _log.info("Start: Flowsheet Visualizer example")
    fv_example()
    _log.info("Finished: Flowsheet Visualizer example")


if __name__ == "__main__":
    main()
