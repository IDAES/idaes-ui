import pytest
from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet


@pytest.fixture
def flowsheet():
    """A flowsheet for all the various tests."""
    return idaes_demo_flowsheet()

