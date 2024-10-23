#################################################################################
# The Institute for the Design of Advanced Energy Systems Integrated Platform
# Framework (IDAES IP) was produced under the DOE Institute for the
# Design of Advanced Energy Systems (IDAES).
#
# Copyright (c) 2018-2023 by the software owners: The Regents of the
# University of California, through Lawrence Berkeley National Laboratory,
# National Technology & Engineering Solutions of Sandia, LLC, Carnegie Mellon
# University, West Virginia University Research Corporation, et al.
# All rights reserved.  Please see the files COPYRIGHT.md and LICENSE.md
# for full copyright and license information.
#################################################################################
# TODO: Missing doc strings
# pylint: disable=missing-module-docstring

# stdlib
from collections import namedtuple
from pathlib import Path
import os
import sys
import time
from typing import Optional, Union, Dict, Tuple
import webbrowser

# package
from idaes import logger
from .model_server import FlowsheetServer
from . import persist, errors


# Logging
_log = logger.getLogger(__name__)

# Module globals
web_server = None

#: Maximum number of saved versions of the same `save` file.
#: Set to zero if you want to allow any number.
MAX_SAVED_VERSIONS = 100


# Classes and functions

#: Return value for `visualize()` function. This namedtuple has three
#: attributes that can be accessed by position or name:
#:
#: - store = :class:`idaes.core.ui.fv.persist.DataStore` object (with a ``.filename`` attribute)
#: - port = Port number (integer) where web server is listening
#: - server = :class:`idaes.core.ui.fv.model_server.FlowsheetServer` object for the web server thread
#:
VisualizeResult = namedtuple(
    "VisualizeResult", ["store", "port", "server", "save_diagram"]
)


def visualize(
    flowsheet,
    name: str = "flowsheet",
    save: Optional[Union[Path, str, bool]] = None,
    load_from_saved: bool = True,
    save_dir: Optional[Path] = None,
    save_time_interval=5000,  # 5 seconds
    overwrite: bool = False,
    browser: bool = True,
    port: Optional[int] = None,
    log_level: int = logger.WARNING,
    quiet: bool = False,
    loop_forever: bool = False,
    screenshot: bool = True,
) -> VisualizeResult:
    """Visualize the flowsheet in a web application.

    The web application is started in a separate thread and this function returns immediately.

    Also open a browser window to display the visualization app. The URL is printed unless ``quiet`` is True.

    Args:
        flowsheet: IDAES flowsheet to visualize
        name: Name of flowsheet to display as the title of the visualization
        load_from_saved: If True load from saved file if any. Otherwise create
          a new file or overwrite it (depending on 'overwrite' flag).
        save: Where to save the current flowsheet layout and values. If this argument is not specified,
          "``name``.json" will be used (if this file already exists, a "-`<version>`" number will be added
          between the name and the extension). If the value given is the boolean 'False', then nothing
          will be saved. The boolean 'True' value is treated the same as unspecified.
        save_dir: If this argument is given, and ``save`` is not given or a relative path, then it will
           be used as the directory to save the default or given file. The current working directory is
           the default. If ``save`` is given and an absolute path, this argument is ignored.
        save_time_interval: The time interval that the UI application checks if any changes has occurred
            in the graph for it to save the model. Default is 5 seconds
        overwrite: If True, and the file given by ``save`` exists, overwrite instead of creating a new
          numbered file.
        browser: If true, open a browser
        port: Start listening on this port. If not given, find an open port.
        log_level: An IDAES logging level, which is a superset of the built-in :mod:`logging` module levels.
          See the :mod:`idaes.logger` module for details
        quiet: If True, suppress printing any messages to standard output (console)
        loop_forever: If True, don't return but instead loop until a Control-C is received. Useful when
           invoking this function at the end of a script.

    Returns:
        See :data:`VisualizeResult`

    Raises:
        :mod:`idaes.core.ui.fv.errors.VisualizerSaveError`: if the data storage at 'save_as' can't be opened
        :mod:`idaes.core.ui.fv.errors.VisualizerError`: Any other errors
        RuntimeError: If too many versions of the save file already exist. See :data:`MAX_SAVED_VERSIONS`.
    """
    global web_server  # pylint: disable=global-statement

    # Initialize IDAES logging
    _init_logging(log_level)

    # Start the web server
    if web_server is None:
        web_server = FlowsheetServer(port=port)
        web_server.add_setting("save_time_interval", save_time_interval)
        web_server.start()
        if not quiet:
            _log.info("Started visualization server")
    else:
        _log.info(f"Using HTTP server on localhost, port {web_server.port}")

    # Set up save location
    use_default = False
    if save is None or save is True:
        save_path = _pick_default_save_location(name, save_dir)
        use_default = True
    elif save is False:
        save_path = None
    else:
        try:
            save_path = Path(save)
        except TypeError as err:
            raise errors.VisualizerSaveError(
                save, f"Cannot convert 'save' value to Path object: {err}"
            )
        if save_dir is not None and not save_path.is_absolute():
            save_path = save_dir / save_path
    # Create datastore for save location
    if save_path is None:
        datastore = persist.MemoryDataStore()
    else:
        if save_path.exists() and load_from_saved:
            # Load from saved
            datastore = persist.DataStore.create(save_path)
            _log.info(f"Loading saved flowsheet from '{save_path}'")
            datastore.load()
        else:
            # Create new file
            # deal with duplicate names
            try:
                save_path = _handle_existing_save_path(
                    name,
                    save_path,
                    max_versions=MAX_SAVED_VERSIONS,
                    overwrite=overwrite,
                )
            except errors.TooManySavedVersions as err:
                raise RuntimeError(f"In visualize(): {err}")
            datastore = persist.DataStore.create(save_path)

        if use_default:
            if not quiet:
                cwd = save_path.parent.absolute()
                _log.info(
                    f"Saving flowsheet to default file '{save_path.name}' in current"
                    f" directory ({cwd})"
                )
        else:
            if not quiet:
                print(f"Saving flowsheet to {str(datastore)}")

    # Add our flowsheet to it
    try:
        new_name = web_server.add_flowsheet(name, flowsheet, datastore)
    except (errors.ProcessingError, errors.DatastoreError) as err:
        raise errors.VisualizerError(f"Cannot add flowsheet: {err}")

    if new_name != name:
        _log.warning(f"Flowsheet name changed: old='{name}' new='{new_name}'")
        if not quiet:
            print(f"Flowsheet name changed to '{new_name}'")
        name = new_name

    # Open a browser window for the UI
    url = f"http://localhost:{web_server.port}/app?id={name}"
    if browser:
        success = webbrowser.open(url)
        if success:
            _log.debug("Flowsheet opened in browser window")
        else:
            _log.warning(f"Could not open flowsheet URL '{url}' in browser")

    if not quiet:
        _log.info(f"Flowsheet visualization at: {url}")

    if loop_forever:
        _loop_forever(quiet)

    def save_diagram(
        screenshot_name: str = name,
        image_type: str = "svg",
        save_to: str = "screenshots",
        display: bool = True,
    ) -> dict:
        """Capture Screenshot of Flowsheet Diagram

        This function enables users to capture a screenshot of a flowsheet diagram.

        The screenshot can be saved either to a user-defined path or to the default ./screenshot folder.

        Additionally, users can control whether to display the screenshot in the running environment by adjusting the display argument.

        Args:
            screenshot_name: string, use to save as screenshot name, default is flowsheet name from parent function
            image_type: string, use to save as screenshot image type, default is svg, now supporting svg, png
            save_to: string, use to define where screenshot should save to, default is ./screenshots
            display: bool, use to control if display screenshot or not

        Returns:
            dict: A dictionary with the following keys:
                screenshot_image_type (str) : screenshot saved image type name as string.
                validated_save_path (str) : the final save path after validation by the function _validate_and_create_save_path.
                diagram_saved_path (str): the path where the diagram is saved.
        """
        import asyncio
        import nest_asyncio
        from IPython.display import clear_output

        # clear server print in console to prevent too many output
        clear_output(wait=True)

        # define live server URL let backend running chrome to get screen
        live_server_url = f"http://localhost:{web_server.port}/app?id={name}"

        # re-log visualizer running at URL
        _log.info(f"Visualizer live server is running at: {live_server_url}")

        # define image type use as lower case string, if undefined assign svg as default
        default_image_types = ("png", "svg")

        # set image_type to lower for later use to compare with default_image_types
        if image_type:
            image_type = image_type.lower()

        # if user set image_type arg invalid set it as default svg and print message
        if not image_type or not image_type in default_image_types:
            _log.warning(
                f"[{image_type} is not supported] Only PNG and SVG are supported as diagram screenshot types. The default image type has been set to SVG."
            )
            image_type = "svg"

        # set file save path
        validate_path_return = _validate_and_create_save_path(save_to)
        valid_save_path = validate_path_return["path_to_use"]

        # log save_to_info if user's save path is invalid
        if not valid_save_path == save_to:
            _log.warning(
                f"The save path {save_to} is invalid, now save path change to {valid_save_path}"
            )

        # use async loop to run async playwright diagram async generator
        nest_asyncio.apply()
        loop = asyncio.get_event_loop()
        save_diagram_return = loop.run_until_complete(
            _async_save_diagram(
                screenshot_name=screenshot_name,
                live_server_url=live_server_url,
                save_to=valid_save_path,
                image_type=image_type,
                display=display,
            )
        )

        return {
            "screenshot_image_type": image_type,
            "valid_save_path": valid_save_path,
            "default_save_path": validate_path_return["default_save_path"],
            "diagram_saved_path": save_diagram_return["diagram_saved_path"],
        }

    return VisualizeResult(
        store=datastore,
        port=web_server.port,
        server=web_server,
        save_diagram=save_diagram,
    )


def _loop_forever(quiet):
    try:
        if not quiet:
            print("Type ^C to stop the program")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        if not quiet:
            print("Program stopped")


def _pick_default_save_location(name, save_dir):
    """Pick a default save location."""
    if not save_dir:
        save_dir = Path(".")
    save_path = save_dir / f"{name}.json"
    return save_path


def _handle_existing_save_path(name, save_path, max_versions=10, overwrite=None):
    """Set up for overwrite/versioning for existing save paths."""
    save_dir = save_path.parent
    # Handle simple cases: overwrite, and no existing file
    if overwrite:
        if save_path.exists():
            _log.warning(f"Overwriting existing save file '{save_path}'")
            save_path.open("w")  # blank file
        return save_path
    elif not save_path.exists():
        return save_path
    # Find the next version that does not exist
    _log.info(f"Save file {save_path} exists. Creating new version")
    counter = 0
    if max_versions == 0:
        max_versions = sys.maxsize  # millions of years of file-creating fun
    while save_path.exists() and counter < max_versions:
        counter += 1
        save_file = f"{name}-{counter}.json"
        save_path = save_dir / save_file
    # Edge case: too many NAME-#.json files for this NAME
    if counter == max_versions:
        why = (
            f"Found {max_versions} numbered files of form '{name}-<num>.json'. That's"
            " too many."
        )
        _log.error(why)
        raise errors.TooManySavedVersions(why)
    # Return new (versioned) path
    _log.info(f"Created new version for save file: {save_path}")
    return save_path


def _init_logging(lvl):
    ui_logger = logger.getIdaesLogger("ui", level=lvl, tag="ui")
    ui_logger.setLevel(lvl)


def _validate_and_create_save_path(save_to):
    """
    check user's path is valid or use default path

    Args:
        save_to: string, the path user provided
    Returns:
        path_to_use: the path use to save diagram screenshot
    """
    # setup default saving path
    default_path = os.path.join(os.getcwd(), "screenshots")

    if save_to is None or save_to.strip() == "":
        _log.warning(f"No path provided. Using default path: {default_path}")
        path_to_use = default_path
    else:
        # change path to abs path
        abs_path = os.path.abspath(save_to)

        # check if path exist
        if not os.path.exists(abs_path):
            try:
                os.makedirs(abs_path)
                _log.info(f"Created directory: {abs_path}")
                path_to_use = abs_path
            except Exception as e:
                _log.error(f"Error creating directory {abs_path}: {e}")
                _log.info(f"Using default path: {default_path}")
                path_to_use = default_path
        else:
            # check can write into user's path
            if os.access(abs_path, os.W_OK):
                path_to_use = abs_path
            else:
                _log.warning(f"No write permission for {abs_path}")
                _log.info(f"Using default path: {default_path}")
                path_to_use = default_path

    # make sure default path is exist
    if path_to_use == default_path and not os.path.exists(default_path):
        os.makedirs(default_path)

    _log.warning(f"save path is {path_to_use}")
    return {"path_to_use": path_to_use, "default_save_path": default_path}


async def _async_save_diagram(
    screenshot_name: str,
    live_server_url: str,
    save_to: str,
    image_type: str,
    display: bool,
):
    """
    use playwright simulate user click website, to save diagram as svg or png screenshot into user defined save_path or default folder

    Args:
        screenshot_name: string use as screenshot saved name, if undefined will use flowsheet as screenshot saved name
        live_server_url: string use for playwright to open browser on
        save_to: string where to save the screenshot file
        image_type: string the screenshot image type
        display: bool to display or not display it in jupyter
    """
    # import playwright to generate screenshot
    from playwright.async_api import async_playwright
    from IPython.display import SVG
    from IPython.display import Image
    from IPython.display import display as IPythonDisplay

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True, args=["--no-sandbox"], timeout=500000
        )
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        try:
            # Go to visualizer URL and wait document load
            await page.goto(live_server_url)
            await page.wait_for_load_state("networkidle")

            # Hover on download menu show download option list
            await page.hover("#diagram_download_icon")

            # Base on image_type to click different image download btn
            if image_type == "png":
                await page.click("#headerExportImageBtn")
            else:
                await page.click("#headerExportSvgBtn")

            # Click download btn on UI pop modal
            async with page.expect_download() as download_info:
                await page.click(".control-button", timeout=6000000)

            # Get download value
            download = await download_info.value

            # Wait for download to complete
            download_path = await download.path()

            diagram_saved_path = os.path.join(
                save_to, f"{screenshot_name}.{image_type}"
            )
            # Move download to save_to and display image and display image saved path
            if os.path.exists(download_path):
                # Save image to save to and display

                # read from download screenshot file
                with open(download_path, "rb") as source_file:
                    file_content = source_file.read()
                # write to save path
                with open(diagram_saved_path, "wb") as target_file:
                    target_file.write(file_content)

                # remove playwright downloaded screenshot file when diagram_saved_path != download_path
                if diagram_saved_path != download_path and os.path.exists(
                    download_path
                ):
                    os.remove(download_path)

                if os.path.exists(diagram_saved_path):
                    _log.info(f"File downloaded: {diagram_saved_path}")
                else:
                    _log.error(f"screenshot fail to save to: {diagram_saved_path}")

                # get if user is in jupyter notebook or not
                # if not in jupyter notebook will only return screenshot path
                in_jupyter = _is_jupyter()
                if in_jupyter and display:
                    display = True
                else:
                    display = False

                # check display and image_type to out put image and image path
                if display and image_type == "svg":
                    # display svg and display screenshot
                    IPythonDisplay(SVG(filename=diagram_saved_path))

                if display and image_type == "png":
                    # display png images
                    IPythonDisplay(Image(filename=diagram_saved_path))
            else:
                _log.error("Diagram file not found")
                return None

        except Exception as e:
            _log.error(f"Unable to capture diagram: {e}")
            return None

        finally:
            await browser.close()

        return {"diagram_saved_path": diagram_saved_path}


def _is_jupyter():
    """Check if the code is running in a Jupyter notebook environment"""
    try:
        # try import get_ipython to identify if user is in jupyter
        from IPython import get_ipython

        shell = get_ipython().__class__.__name__
        if shell == "ZMQInteractiveShell":
            return True  # Jupyter notebook or qtconsole
        elif shell == "TerminalInteractiveShell":
            return False  # Terminal running IPython
        else:
            return False  # Other type (?)
    except NameError:
        return False  # Probably standard Python interpreter
