from pathlib import Path
from typing import Optional, Union, Dict, Tuple


class InitialParams:
    """This class use to populate all params use in "self" (main_class) in the main.
    Args:
        main_class: the class instence called this class
        flowsheet: flowsheet
        name: flowsheet name
        port: Optional, port for uvicorn serve web default 8000
        save_time_interval: Optional, the duration time will send to front end to call api/put_fs to update flowsheet, default 5s
        save_dir: Optional, dir use to store user saved flowsheet, default "./saved_flowsheet"
    """

    def __init__(
        self,
        main_class,
        flowsheet,
        name,
        port: Optional[int] = None,
        save_time_interval: Optional[int] = 5,
        save: Optional[Union[Path, str, bool]] = None,
        save_dir: Optional[Path] = None,
        load_from_saved: bool = True,
        overwrite: bool = False,
        test: bool = False,
        browser: bool = True,
    ):
        # initial everything related to flowsheet
        main_class.flowsheet = flowsheet
        main_class.flowsheet_name = name

        # populate web port
        if port is not None:
            main_class.port = port
        else:
            main_class.port = 8000

        # initial save_time_interval
        main_class.save_time_interval = save_time_interval

        # initial save
        main_class.save = save

        # initial save dir
        if save_dir:
            main_class.save_dir = save_dir
        else:
            main_class.save_dir = "."

        # initial load from save
        main_class.load_from_saved = load_from_saved

        # initial overwite
        main_class.overwrite = overwrite

        # initial test param
        main_class.test = test

        # initial browser
        main_class.browser = browser
