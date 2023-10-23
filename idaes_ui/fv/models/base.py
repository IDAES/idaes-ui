"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""
__author__ = "Dan Gunter"
__created__ = "2023-10-08"

from pydantic import BaseModel


# Exceptions

class DiagnosticsException(Exception):
    """Superclass of errors related to model statistics and diagnostics data raised in this module.
    """
    def __init__(self, name, details=None):
        self.name = name
        self.details = details
        msg = f"Diagnostic '{name}' failed"
        self.message = msg
        if details:
            msg += f": {details}"
        super().__init__(msg)


# Models

class DiagnosticsError(BaseModel):
    error_type: str
    error_message: str
    error_details: str

    @classmethod
    def from_exception(cls, exc: DiagnosticsException):
        return cls(error_type=exc.name, error_message=exc.message,
                   error_details=(exc.details or ""))

