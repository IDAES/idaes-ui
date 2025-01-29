import os
import asyncio
import nest_asyncio
from IPython.display import clear_output
from .model_server import FlowsheetServer
import logging


_log = logging.getLogger(__name__)


class SaveDiagramScreenshot:
    def __init__(
        self,
        name: str,
        port: int,
    ):
        self.name = name
        self.port = port
        self.default_screenshot_save_path = os.path.join(os.getcwd(), "screenshots")

        # define image type use as lower case string, if undefined assign svg as default
        self.default_image_types = ("png", "svg")
        self.live_server_url = f"http://localhost:{self.port}/app?id={self.name}"

    def save_diagram_screenshot(
        self,
        screenshot_name: str,
        image_type: str = "svg",
        screenshot_save_to: str = None,
        display: bool = False,
    ) -> dict:
        """Capture Screenshot of Flowsheet Diagram

        This function allows users to capture a screenshot of a flowsheet diagram.

        The screenshot can be saved either to a user-defined path or to the default ./screenshot folder.

        Additionally, users can control whether to display the screenshot in the running environment by adjusting the display argument (currently only support display in Jupyter notebook).

        Args:
            screenshot_name: string, use to save as screenshot name, default is flowsheet name from parent function
            image_type: string, use to save as screenshot image type, default is svg, now supporting svg, png
            screenshot_save_to: string, use to define where screenshot should save to, default is ./screenshots
            display: bool, use to control if display screenshot or not

        Returns:
            dict: A dictionary with the following keys:
                screenshot_image_type (str) : screenshot saved image type name as string.
                validated_save_path (str) : the final save path after validation by the function _validate_and_create_save_path.
                diagram_saved_path (str): the path where the diagram is saved.
        """
        # clear server print in console to prevent too many output
        clear_output(wait=True)

        # define live server URL let backend running chrome to get screen
        live_server_url = self.live_server_url

        # re-log visualizer running at URL
        _log.info(f"Visualizer live server is running at: {live_server_url}")

        # check user input image_type and format it.
        # set image_type to lower for later use to compare with default_image_types
        if image_type:
            image_type = image_type.lower()

        # if user set image_type arg invalid set it as default svg and print message
        if not image_type or not image_type in self.default_image_types:
            _log.warning(
                f"[{image_type} is not supported] Only PNG and SVG are supported as diagram screenshot types. The default image type has been set to SVG."
            )
            image_type = "svg"

        # validate user's save path
        if not screenshot_save_to:
            valid_screenshot_save_path = self.default_screenshot_save_path
            _log.warning(
                f"No screenshot_save_path provided. Using default path: {self.default_screenshot_save_path}"
            )
        else:
            # check user provided path is valid
            valid_screenshot_save_path = self._validate_and_create_save_path(
                screenshot_save_to
            )

        try:
            nest_asyncio.apply()
            loop = asyncio.get_event_loop()
            save_diagram_return = loop.run_until_complete(
                self._async_save_diagram(
                    screenshot_name=screenshot_name,
                    live_server_url=live_server_url,
                    save_to=valid_screenshot_save_path,
                    image_type=image_type,
                    display=display,
                )
            )

            if save_diagram_return is None:
                raise Exception("Failed to save diagram")

            _log.info(f"save diagram in save_diagram_screenshot.py success")

            return {
                "screenshot_image_type": image_type,
                "valid_save_path": valid_screenshot_save_path,
                "default_save_path": self.default_screenshot_save_path,
                "diagram_saved_path": save_diagram_return["diagram_saved_path"],
            }
        except Exception as e:
            _log.error(f"save diagram in save_diagram_screenshot.py fail: {e}")
            return

    async def _async_save_diagram(
        self,
        screenshot_name: str,
        live_server_url: str,
        save_to: str,
        image_type: str,
        display: bool = True,
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
            try:
                # launch browser
                _log.info("launching browser, Max timeout 30s")
                browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
                context = await browser.new_context(
                    viewport={"width": 1920, "height": 1080}
                )
                _log.info("browser launched")

                # load page
                _log.info("loading page")
                page = await context.new_page()
                _log.info("page loaded")

                # Go to visualizer URL and wait document load
                _log.info(f"going to {live_server_url} waiting for document load")
                await page.goto(live_server_url)
                await page.wait_for_load_state("networkidle")
                _log.info("web document loaded")

                # Hover on download menu show download option list
                _log.info("hover on download menu show download option list")
                await page.hover("#diagram_download_icon", timeout=10000)

                # Base on image_type to click different image download btn
                _log.info(f"clicking {image_type} download btn")
                if image_type == "png":
                    await page.click("#headerExportImageBtn", timeout=10000)
                elif image_type == "svg":
                    await page.click("#headerExportSvgBtn", timeout=10000)
                else:
                    error_msg = f"image type {image_type} is not supported, it should not shown in this function go check the save_diagram function"
                    _log.error(error_msg)
                    raise ValueError(error_msg)

                # Checking after click download which type of screenshot button, the download button should show up.
                _log.info(
                    "Screenshot type button clicked, now checking if it downloadable"
                )
                try:
                    download_button = page.locator(".control-button")
                    await download_button.wait_for(state="visible", timeout=10000)
                    if not await download_button.is_visible():
                        error_msg = (
                            "Download button not found, can't download screenshot"
                        )
                        _log.error(error_msg)
                        raise ValueError(error_msg)
                except TimeoutError:
                    error_msg = "Timeout waiting for download button to appear"
                    _log.error(error_msg)
                    raise ValueError(error_msg)

                # Click download btn on UI pop modal
                async with page.expect_download() as download:
                    await page.click(".control-button")

                # Get download value
                download_item = await download.value

                # Wait for download to complete
                download_path = await download_item.path()

                # double check download path is exist
                if not download_path or not os.path.exists(download_path):
                    error_msg = f"Download path {download_path} not exist"
                    _log.error(error_msg)
                    # if raise this error need to check playwright download function why has download item but no download path
                    raise ValueError(error_msg)

                # check we can read and write in download path
                if not os.access(download_path, os.R_OK) or not os.access(
                    download_path, os.W_OK
                ):
                    error_msg = (
                        f"Can't read and write in download path: {download_path}"
                    )
                    _log.error(error_msg)
                    raise ValueError(error_msg)

                customized_screenshot_save_path = os.path.join(
                    save_to, f"{screenshot_name}.{image_type}"
                )

                # relocated download screenshot to save path
                # read from download screenshot file
                try:
                    _log.info(
                        f"Moving download screenshot from {download_path} to {customized_screenshot_save_path}"
                    )
                    with open(download_path, "rb") as source_file:
                        file_content = source_file.read()
                    # write to save path
                    with open(customized_screenshot_save_path, "wb") as target_file:
                        target_file.write(file_content)
                except Exception as e:
                    error_msg = f"Failed to move download screenshot from {download_path}  to {customized_screenshot_save_path}: Error message{e}"
                    _log.error(error_msg)
                    raise ValueError(error_msg)

                # clean up temp playwright downloaded screenshot temp file
                if customized_screenshot_save_path != download_path and os.path.exists(
                    download_path
                ):
                    os.remove(download_path)

                # check if screenshot is saved successfully
                if os.path.exists(customized_screenshot_save_path):
                    _log.info(
                        f"Screenshot downloaded at: {customized_screenshot_save_path}"
                    )
                else:
                    error_msg = f"screenshot fail to save, at after try to move download screenshot to save path"
                    _log.error(error_msg)
                    raise ValueError(error_msg)

                # check if current environment is jupyter notebook
                in_jupyter = self._is_jupyter()

                # if user is not in jupyter and want to display the screenshot log error
                if not in_jupyter and display:
                    _log.error(
                        "Currently only support display screenshot in Jupyter environment"
                    )
                    _log.error(
                        f"Your diagram screenshot is saved at: {customized_screenshot_save_path}"
                    )

                # check if user want to display the screenshot
                if in_jupyter and display:
                    if image_type == "svg":
                        # display svg and display screenshot
                        IPythonDisplay(SVG(filename=customized_screenshot_save_path))
                    elif image_type == "png":
                        # display png images
                        IPythonDisplay(Image(filename=customized_screenshot_save_path))

                return {"diagram_saved_path": customized_screenshot_save_path}

            except Exception as e:
                _log.info(f"_async_save_diagram error: {e}")
                raise e

            finally:
                # close browser any way
                await browser.close()

    def _validate_and_create_save_path(self, save_to):
        """
        check user's path is valid or use default path

        Args:
            save_to: string, the path user provided
        Returns:
            path_to_use: the path use to save diagram screenshot
        """
        # setup default saving path
        default_path = self.default_screenshot_save_path

        if save_to is None or save_to.strip() == "":
            _log.warning(
                f"No screenshot save path provided. Using default path: {default_path}"
            )
            path_to_use = default_path
        else:
            # change path to abs path
            abs_path = os.path.abspath(save_to)

            # check if path exist
            if not os.path.exists(abs_path):
                try:
                    # When folder not exist, try to create it
                    # notice user the folder is not exist creating...
                    _log.info(
                        f"The screenshot save path {abs_path} you provided is not exist on your computer, now try to create it."
                    )

                    # create new folder
                    _log.info(f"Creating directory: {abs_path}")
                    new_screenshot_save_path = os.makedirs(abs_path)

                    # test the new path can be read and write
                    if os.access(new_screenshot_save_path, os.R_OK) and os.access(
                        new_screenshot_save_path, os.W_OK
                    ):
                        path_to_use = new_screenshot_save_path
                        _log.info(
                            f"New screenshot folder is created, now using path: {path_to_use}"
                        )
                    else:
                        path_to_use = default_path
                        _log.warning(
                            f"We can't grant read and write permission to the path you provided, now use default path as screenshot save path: {path_to_use}"
                        )
                except Exception as e:
                    # if any error happen, use default path
                    path_to_use = default_path
                    _log.warning(
                        f"Validate path got error, now using default path as screenshot save path: {default_path}"
                    )
                    _log.error(f"Error creating directory {abs_path}: {e}")
            else:
                # check can write into user's path
                if os.access(abs_path, os.W_OK) and os.access(abs_path, os.R_OK):
                    path_to_use = abs_path
                else:
                    path_to_use = default_path
                    _log.warning(
                        f"We can't grant read and write permission to the path you provided, now use default path as screenshot save path: {path_to_use}"
                    )

        # make sure default path is exist
        if path_to_use == default_path and not os.path.exists(default_path):
            os.makedirs(default_path)

        _log.info(f"save path is {path_to_use}")

        # return the final path to save diagram screenshot
        return path_to_use

    def _is_jupyter(self):
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
