"""
Data model for IDAES FV settings
"""

__author__ = "Dan Gunter"
__created__ = "2023-10-23"

from pydantic import BaseModel


class AppSettings(BaseModel):
    autosave_interval: int = 5
