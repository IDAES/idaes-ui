"""
Run the Cypress tests
"""
import logging
import os
from pathlib import Path
import shutil
from subprocess import run, Popen, CalledProcessError, PIPE
import sys

logging.basicConfig()
_log = logging.getLogger("run_cypress")
_log.setLevel(logging.INFO)


# noinspection SpellCheckingInspection
def main():
    cwd = Path(os.path.curdir).absolute()
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent.absolute()
    if root_dir != cwd:
        _log.info(f"change directory to root {root_dir}")
        os.chdir(root_dir)

    npm_exe = shutil.which("npm")
    waiton_exe = shutil.which("wait-on")
    _log.info(f"executables: npm={npm_exe} wait-on={waiton_exe}")
    assert npm_exe
    assert waiton_exe

    code = 0

    _log.info("start flowsheet visualizer example")
    fv_proc = Popen([npm_exe, "run", "startfv"], stderr=PIPE, stdout=PIPE)

    _log.info("wait for flowsheet visualizer to start")
    url = "http-get://127.0.0.1:49000/app?id=sample_visualization"
    run([waiton_exe, url])

    _log.info("run cypress tests")
    try:
        command = [npm_exe, "run", "cypress:run"]
        for spec in ("fv",):
            spec_path = Path("cypress") / "e2e" / f"{spec}.cy.js"
            options = ["--spec", str(spec_path)]
            _log.info(f"running cypress: {' '.join(command)} {' '.join(options)}")
            run(command + options, check=True)
    except CalledProcessError as err:
        msg = f"Test failed: {err.cmd}"
        _log.error(msg)
        code = err.returncode

    _log.info("stopping server")
    with Path("stop_fv_example.txt").open("w") as f:
        f.write("stop")

    if root_dir != cwd:
        _log.info(f"change directory to original {cwd}")
        os.chdir(cwd)

    return code


if __name__ == "__main__":
    sys.exit(main())
