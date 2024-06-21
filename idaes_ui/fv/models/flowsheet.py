"""
Data model for IDAES flowsheet + metadata
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-23"

from pydantic import BaseModel
from typing import Dict, List
from idaes_ui.fv.flowsheet import FlowsheetSerializer, FlowsheetDiff


DEFAULT_NAME = "Flowsheet"


class Flowsheet(BaseModel):
    name: str = DEFAULT_NAME
    model: Dict  # IDAES model
    cells: List[Dict]  # JointJS 'cells'
    routing_config: Dict  # metadata

    def __init__(self, fs=None, **kwargs):
        if fs:
            srz = FlowsheetSerializer(fs, name=kwargs.get("name", DEFAULT_NAME))
            d = srz.as_dict()
            kwargs.update(d)  # keys match Flowsheet attrs
        super().__init__(**kwargs)


def merge_flowsheets(cur: Flowsheet, changed: Flowsheet) -> Flowsheet:
    fs_cur = {
        "model": cur["model"],
        "cells": cur["cells"],
        "routing_config": cur["routing_config"],
    }
    fs_changed = {
        "model": changed["model"],
        "cells": changed["cells"],
        "routing_config": changed["routing_config"],
    }
    diff = FlowsheetDiff(fs_changed, fs_cur)
    d = diff.merged()
    return Flowsheet(name=changed["model"]["id"], **d)
