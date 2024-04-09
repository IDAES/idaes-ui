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
VisualizeResult = namedtuple("VisualizeResult", ["store", "port", "server"])


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

    return VisualizeResult(store=datastore, port=web_server.port, server=web_server)


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


# #################################################################################
# # The Institute for the Design of Advanced Energy Systems Integrated Platform
# # Framework (IDAES IP) was produced under the DOE Institute for the
# # Design of Advanced Energy Systems (IDAES).
# #
# # Copyright (c) 2018-2023 by the software owners: The Regents of the
# # University of California, through Lawrence Berkeley National Laboratory,
# # National Technology & Engineering Solutions of Sandia, LLC, Carnegie Mellon
# # University, West Virginia University Research Corporation, et al.
# # All rights reserved.  Please see the files COPYRIGHT.md and LICENSE.md
# # for full copyright and license information.
# #################################################################################
# # TODO: Missing doc strings
# # pylint: disable=missing-module-docstring

# # stdlib
# from collections import namedtuple
# from pathlib import Path
# from typing import Optional, Union, Dict, Tuple
# import pickle

# # package
# from idaes import logger
# from . import persist, errors
# from .fastAPI_functions.server_manager import ServerManager

# # Logging
# _log = logger.getLogger(__name__)

# # Module globals
# # web_server = None

# # Import FastAPI app
# # from .app import FlowsheetApp

# #: Maximum number of saved versions of the same `save` file.
# #: Set to zero if you want to allow any number.
# MAX_SAVED_VERSIONS = 100


# # Classes and functions

# #: Return value for `visualize()` function. This namedtuple has three
# #: attributes that can be accessed by position or name:
# #:
# #: - store = :class:`idaes.core.ui.fv.persist.DataStore` object (with a ``.filename`` attribute)
# #: - port = Port number (integer) where web server is listening
# #: - server = :class:`idaes.core.ui.fv.model_server.FlowsheetServer` object for the web server thread
# #:
# VisualizeResult = namedtuple("VisualizeResult", ["store", "port", "server"])


# def visualize(
#     flowsheet,
#     name: str = "flowsheet",
#     save: Optional[Union[Path, str, bool]] = None,
#     load_from_saved: bool = True,
#     save_dir: Optional[Path] = None,
#     save_time_interval: Optional[int] = 5,  # 5 seconds
#     overwrite: bool = False,
#     browser: bool = True,
#     port: Optional[int] = None,
#     log_level: int = logger.WARNING,
#     quiet: bool = False,
#     loop_forever: bool = False,
#     test: bool = False,
#     clean_up: Optional[bool] = False,
#     display_server: Optional[bool] = False,
#     remove_server_from_server_list: Optional[str] = None,
# ) -> VisualizeResult:
#     """Visualize the flowsheet in a web application.

#     The web application is started in a separate thread and this function returns immediately.

#     Also open a browser window to display the visualization app. The URL is printed unless ``quiet`` is True.

#     Args:
#         flowsheet: IDAES flowsheet to visualize
#         name: Name of flowsheet to display as the title of the visualization
#         load_from_saved: If True load from saved file if any. Otherwise create
#                 a new file or overwrite it (depending on 'overwrite' flag).
#         save: Where to save the current flowsheet layout and values. If this argument is not specified,
#                 "``name``.json" will be used (if this file already exists, a "-`<version>`" number will be added
#                 between the name and the extension). If the value given is the boolean 'False', then nothing
#                 will be saved. The boolean 'True' value is treated the same as unspecified.
#         save_dir: If this argument is given, and ``save`` is not given or a relative path, then it will
#                 be used as the directory to save the default or given file. The current working directory is
#                 the default. If ``save`` is given and an absolute path, this argument is ignored.
#         save_time_interval: The time interval that the UI application checks if any changes has occurred
#                 in the graph for it to save the model. Default is 5 seconds
#         overwrite: If True, and the file given by ``save`` exists, overwrite instead of creating a new
#                 numbered file.
#         browser: If true, open a browser
#         port: Start listening on this port. If not given, find an open port.
#         log_level: An IDAES logging level, which is a superset of the built-in :mod:`logging` module levels.
#                 See the :mod:`idaes.logger` module for details
#         quiet: If True, suppress printing any messages to standard output (console)
#         loop_forever: If True, don't return but instead loop until a Control-C is received. Useful when
#                 invoking this function at the end of a script.
#         test: bool, use for test only the if True uvcorn won't start, and prevent forever loop in pytest
#         clean_up: bool use for clean up running_server.pickle which is stores all running server init, when this is True, the visualize will only clean up the pickle file won't start any visualiztion
#         display_server:bool use for display server list is running
#     Returns:
#         fastapi instence
#     """

#     if clean_up:
#         # if clean_up is True this will clean up running_server.pickle to prevent browser is closed and running server is in list and won't start browser
#         print("Cleaning up the running_server list from running_server.pickle")
#         clean_up_handler()

#         # check if running_server.pickle is clean up
#         with open("running_server.pickle", "rb") as file:
#             running_server = pickle.load(file)
#             if running_server == {}:
#                 print("Successfully removed all server from running_server.pickle!")
#             else:
#                 print("Fail to clean up all running server!")

#     if display_server:
#         with open("running_server.pickle", "rb") as file:
#             running_server = pickle.load(file)
#         print("You have running server list:")
#         print(
#             "*************************************************************************"
#         )
#         for item in running_server:
#             print(
#                 f"Flowsheet name: {item} Running on port: {running_server[item]['port']}"
#             )
#             print(f"Link: http://127.0.0.1:{running_server[item]['port']}?id={item}")
#         print(
#             "*************************************************************************"
#         )

#     if remove_server_from_server_list:
#         with open("running_server.pickle", "rb") as file:
#             running_server_list = pickle.load(file)
#         if not remove_server_from_server_list in running_server_list:
#             print(
#                 f"The flowsheetname {running_server_list} is not in the running server list"
#             )
#             print(
#                 f"Please use m.fs.visualize('your_flowsheet_name', display_server=Ture) to view the server list."
#             )
#             return
#         else:
#             del running_server_list[running_server_list]
#             with open("running_server.pickle", "wb") as file:
#                 pickle.dump(running_server_list, file)
#             print(
#                 f"Successfully remove server: {remove_server_from_server_list} from running server list."
#             )

#     # print instruction for user to screen
#     print_to_screen(name)

#     # start server manager, store instence into variable
#     server_manager_instence = ServerManager(
#         flowsheet=flowsheet,
#         flowsheet_name=name,
#         port=port,
#         save_time_interval=save_time_interval,
#         save=save,
#         save_dir=save_dir,
#         load_from_saved=load_from_saved,
#         overwrite=overwrite,
#         test=test,
#         browser=browser,
#     )

#     # return fastapi instence from server manager instence
#     return server_manager_instence.fastapi_app


# def clean_up_handler():
#     """backup clean up function use to clean up all running_server from  running_server.pickle
#     return:
#       Void
#     """
#     pickle_file_path = "running_server.pickle"
#     # write rest of running servers back to the running_server.pickle
#     with open(pickle_file_path, "wb") as file:
#         pickle.dump({}, file)


# def print_to_screen(flowsheet_name):
#     """Check if current visualize flowsheet name is in running server list
#     if in will print instruction to user
#     instruction contains:
#     1. let user know the server is in running list already and browser won't auto start
#     2. link to the running server, user can click and access the flowsheet UI
#     3. how to clean up the entire running server list
#     4. how to remove the single running server with it's name from running server list
#     """
#     with open("running_server.pickle", "rb") as file:
#         running_server_list = pickle.load(file)

#     if flowsheet_name in running_server_list:
#         # print instruction to user when flowsheet name is in running server list
#         print(
#             "***********************************************************************************************"
#         )
#         print(f"Your flowsheet with name {flowsheet_name} is in running server list.")
#         print(
#             "In this case the browser won't start, if you want to check your flowsheet in browser use this link:"
#         )
#         print(
#             f"http://127.0.0.1:{running_server_list[flowsheet_name]['port']}?id={flowsheet_name}"
#         )
#         print("")
#         print("If you want to clean up running server list back to empty:")
#         print("You can use: m.fs.visualize('your_flowsheet_name, clean_up = True')")
#         print("")
#         print("If you want to only remove the running server with you flowsheet name:")
#         print(
#             "You can use: m.fs.visualize('your_flowsheet_name', remove_server_from_server_list='your_flowsheet_name')"
#         )
#         print(
#             "***********************************************************************************************"
#         )
