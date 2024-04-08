import sys
import json
from pathlib import Path
from idaes import logger
from idaes_ui.fv import persist, errors
from idaes_ui.fv.flowsheet import FlowsheetSerializer


class SaveFlowsheet:
    def __init__(
        self, flowsheet_name, flowsheet, save, save_dir, load_from_saved, overwrite
    ):
        """This class use for handle save flowsheet to file
        Args:
            flowsheet_name: Name of flowsheet to display as the title of the visualization
            save: Where to save the current flowsheet layout and values. If this argument is not specified,
                "``name``.json" will be used (if this file already exists, a "-`<version>`" number will be added
                between the name and the extension). If the value given is the boolean 'False', then nothing
                will be saved. The boolean 'True' value is treated the same as unspecified.

            save_dir: If this argument is given, and ``save`` is not given or a relative path, then it will
                be used as the directory to save the default or given file. The current working directory is
                the default. If ``save`` is given and an absolute path, this argument is ignored.

            load_from_saved: If True load from saved file if any. Otherwise create
                a new file or overwrite it (depending on 'overwrite' flag).

            overwrite: If True, and the file given by ``save`` exists, overwrite instead of creating a new
                numbered file.
        """
        self.flowsheet_name = flowsheet_name
        self.flowsheet = flowsheet
        self.save = save
        self.save_dir = save_dir
        self.save_path = None
        self.use_default = False
        self.load_from_saved = load_from_saved
        self.overwrite = overwrite

        # Logging
        self._log = logger.getLogger(__name__)

        # Set up save location
        if self.save is None or self.save is True:
            # no save path but true, save to .
            self.save_path = self._pick_default_save_location()
        elif save is False:
            # no save path and false won't save
            self.save_path = None
        else:
            # try convert save value to path if error log error
            try:
                self.save_path = Path(save)
            except TypeError as err:
                raise errors.VisualizerSaveError(
                    save, f"Cannot convert 'save' value to Path object: {err}"
                )
            if self.save_dir is not None and not self.save_path.is_absolute():
                self.save_path = self.save_dir / self.save_path

        # TODO: this should be in the fsvis or in the get_fs
        # TODO: initial create new fs from editor or notebook should try to read exist fs first?

        # Create datastore for save location
        # if self.save_path is None:
        #     datastore = persist.MemoryDataStore()
        # else:
        #     if self.save_path.exists() and load_from_saved:
        #         # Load from saved
        #         datastore = persist.DataStore.create(self.save_path)
        #         self._log.info(f"Loading saved flowsheet from '{self.save_path}'")
        #         datastore.load()
        #     else:
        #         # Create new file
        #         # deal with duplicate names
        #         try:
        #             save_path = self._handle_existing_save_path(
        #                 self.flowsheet_name,
        #                 self.save_path,
        #                 max_versions=100,
        #                 overwrite=self.overwrite,
        #             )
        #         except errors.TooManySavedVersions as err:
        #             raise RuntimeError(f"In visualize(): {err}")
        #         datastore = persist.DataStore.create(save_path)

        #     if use_default:
        #         if not quiet:
        #             cwd = save_path.parent.absolute()
        #             _log.info(
        #                 f"Saving flowsheet to default file '{save_path.name}' in current"
        #                 f" directory ({cwd})"
        #             )
        #     else:
        #         if not quiet:
        #             print(f"Saving flowsheet to {str(datastore)}")

    def _pick_default_save_location(self):
        """Pick a default save location."""
        # when no save_dir save to default folder saved_flowsheet
        if not self.save_dir:
            self.save_dir = Path(".")
        # join save_dir and flowsheet_name.json make full path
        save_path = Path(self.save_dir) / f"{self.flowsheet_name}.json"
        return save_path

    def _handle_existing_save_path(
        self, name, save_path, max_versions=10, overwrite=None
    ):
        """Set up for overwrite/versioning for existing save paths."""
        save_dir = save_path.parent
        # Handle simple cases: overwrite, and no existing file
        if overwrite:
            if save_path.exists():
                self._log.warning(f"Overwriting existing save file '{save_path}'")
                save_path.open("w")  # blank file
            return save_path
        elif not save_path.exists():
            return save_path
        # Find the next version that does not exist
        self._log.info(f"Save file {save_path} exists. Creating new version")
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
            self._log.error(why)
            raise errors.TooManySavedVersions(why)
        # Return new (versioned) path
        self._log.info(f"Created new version for save file: {save_path}")
        return save_path

    def save_handler(self):
        """flowsheet save handler, use save_path to save flowsheet, return save message
        if overwrite true, overwrite the latested version
        if flowsheet save exceed MAX_SAVED_VERSIONS return false message
        """
        if not self.overwrite:
            flile_save_to = self._handle_existing_save_path(
                self.flowsheet_name, self.save_path, overwrite=False
            )

            current_flowsheet_dict = FlowsheetSerializer(
                self.flowsheet, self.flowsheet_name, True
            ).as_dict()

            with open(self.save_path, "w") as file:
                json.dump(current_flowsheet_dict, file, indent=4)

        return f"save flowsheet to {self.save_path} successfully!"
