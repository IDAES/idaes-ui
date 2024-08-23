"""
Shared flowsheets for tests
"""

import numpy as np
from idaes.models.properties.swco2 import SWCO2ParameterBlock
from idaes.models.unit_models import Heater, PressureChanger, HeatExchanger
from idaes.models.unit_models.pressure_changer import ThermodynamicAssumption
from pyomo.environ import TransformationFactory, ConcreteModel
from pyomo.network import Arc
from idaes.core import FlowsheetBlock
from idaes.models.properties.activity_coeff_models.BTX_activity_coeff_VLE import (
    BTXParameterBlock,
)
from idaes.models.unit_models import Flash, Mixer
from idaes.models.flowsheets import demo_flowsheet as demo
from idaes.models.flowsheets.demo_flowsheet import build_flowsheet


def demo_flowsheet():
    """Semi-complicated demonstration flowsheet."""
    m = ConcreteModel()
    m.fs = FlowsheetBlock(dynamic=False)
    m.fs.BT_props = BTXParameterBlock()
    m.fs.M01 = Mixer(property_package=m.fs.BT_props)
    m.fs.H02 = Heater(property_package=m.fs.BT_props)
    m.fs.F03 = Flash(property_package=m.fs.BT_props)
    m.fs.s01 = Arc(source=m.fs.M01.outlet, destination=m.fs.H02.inlet)
    m.fs.s02 = Arc(source=m.fs.H02.outlet, destination=m.fs.F03.inlet)
    TransformationFactory("network.expand_arcs").apply_to(m.fs)

    m.fs.properties = SWCO2ParameterBlock()
    m.fs.main_compressor = PressureChanger(
        dynamic=False,
        property_package=m.fs.properties,
        compressor=True,
        thermodynamic_assumption=ThermodynamicAssumption.isentropic,
    )

    m.fs.bypass_compressor = PressureChanger(
        dynamic=False,
        property_package=m.fs.properties,
        compressor=True,
        thermodynamic_assumption=ThermodynamicAssumption.isentropic,
    )

    m.fs.turbine = PressureChanger(
        dynamic=False,
        property_package=m.fs.properties,
        compressor=False,
        thermodynamic_assumption=ThermodynamicAssumption.isentropic,
    )
    m.fs.boiler = Heater(
        dynamic=False, property_package=m.fs.properties, has_pressure_change=True
    )
    m.fs.FG_cooler = Heater(
        dynamic=False, property_package=m.fs.properties, has_pressure_change=True
    )
    m.fs.pre_boiler = Heater(
        dynamic=False, property_package=m.fs.properties, has_pressure_change=False
    )
    m.fs.HTR_pseudo_tube = Heater(
        dynamic=False, property_package=m.fs.properties, has_pressure_change=True
    )
    m.fs.LTR_pseudo_tube = Heater(
        dynamic=False, property_package=m.fs.properties, has_pressure_change=True
    )
    return m.fs


def flash_flowsheet():
    # Model and flowsheet
    m = ConcreteModel()
    m.fs = FlowsheetBlock(dynamic=False)
    # Flash properties
    m.fs.properties = BTXParameterBlock(
        valid_phase=("Liq", "Vap"), activity_coeff_model="Ideal", state_vars="FTPz"
    )
    # Flash unit
    m.fs.flash = Flash(property_package=m.fs.properties)
    # TODO: move this to
    m.fs.flash.inlet.flow_mol.fix(-np.inf, skip_validation=True)
    # Pyomo#2180 is merged
    # m.fs.flash.inlet.flow_mol[:].set_value(np.NINF, True)
    # m.fs.flash.inlet.flow_mol.fix()
    m.fs.flash.inlet.temperature.fix(np.inf)
    m.fs.flash.inlet.pressure[:].set_value(np.nan, True)
    m.fs.flash.inlet.pressure.fix()
    m.fs.flash.inlet.mole_frac_comp[0, "benzene"].fix(0.5)
    m.fs.flash.inlet.mole_frac_comp[0, "toluene"].fix(0.5)
    m.fs.flash.heat_duty.fix(0)
    m.fs.flash.deltaP.fix(0)
    return m.fs


# ----------------------
# Used for diagnostics
# ---------------------


def idaes_demo_flowsheet():
    """Get a demo flowsheet that works with diagnostics."""
    m = build_flowsheet()
    return m.fs


def solve_flowsheet(m):
    """Solve flowsheet function.

    Args:
        m: Model

    Returns:
        a `solve()` method for the model
    """

    def _solve():
        solver = demo.get_solver()
        solver.solve(m, tee=False)

    return _solve
