from pydantic import BaseModel
from idaes.core.util.model_diagnostics import DiagnosticsToolbox as tbx
from pyomo.core.base.block import _BlockData
from typing import Dict, Union, List, Tuple

from idaes.core.util.scaling import (
    get_jacobian,
    jacobian_cond,
)
from pyomo.common.collections import ComponentSet
from idaes.core.util.model_statistics import (
    variables_in_activated_constraints_set,
    deactivated_blocks_set,
    activated_blocks_set,
    activated_equalities_set,
    deactivated_equalities_set,
    activated_inequalities_set,
    deactivated_inequalities_set,
    activated_objectives_set,
    deactivated_objectives_set,
)


class DiagnosticsToolBoxReportData(BaseModel):
    toolbox_jacobian_condition: str = ""
    toolbox_model_statistics: List[str] = []
    structural_report: dict = {}
    numerical_report: dict = {}
    next_steps: dict = {}


class DiagnosticsToolBoxReport:
    """
    Build report by use diagnosticToolbox sub functions
    Args:
        block: the flowsheet model
    return:
        "diagnostics_toolbox_report": {
            toolbox_jacobian_condition: str = ""
            toolbox_model_statistics: List[str] = []
            structural_report: dict = {}
            numerical_report: dict = {}
            next_steps: dict = {}
        }
    """

    def __init__(self, block: _BlockData):
        self.block = block
        self.toolbox_model_statistics = []
        self.update()

    def update(self):
        self.toolbox_jacobian_condition = self.generate_jacobian_condition()
        self.toolbox_model_statistics = self.generate_model_statistics()
        self.structural_report = self.generate_structural_report()
        self.numerical_report = self.generate_numerical_report()
        self.next_steps = self.generate_next_steps()

    def generate_jacobian_condition(self):
        try:
            jac, nlp = get_jacobian(self.block, scaled=False)
            cond = jacobian_cond(jac=jac, scaled=False)
            cond_str = f"{cond:.3E}"
        except RuntimeError:
            cond_str = "Undefined (Exactly Singular)"
        return f"    Jacobian Condition Number: {cond_str}"

    def generate_model_statistics(self):
        return _collect_model_statistics(self.block)

    def generate_structural_report(self):
        return {
            "warning": tbx(self.block)._collect_structural_warnings(),
            "caution": tbx(self.block)._collect_structural_cautions(),
        }

    def generate_numerical_report(self):
        return {
            "warning": tbx(self.block)._collect_numerical_warnings(),
            "caution": tbx(self.block)._collect_numerical_cautions(),
        }

    def generate_next_steps(self):
        return {
            "structural": tbx(self.block)._collect_structural_warnings()[-1],
            "numerical": tbx(self.block)._collect_numerical_warnings()[-1],
        }


# -------------------------------------------------------------------------------------------
# Private module functions
# function taken from diagnosticToolBox private module functions
def _var_in_block(var, block):
    parent = var.parent_block()
    while parent is not None:
        if parent is block:
            return True
        parent = parent.parent_block()
    return False


TAB = " " * 4


def _collect_model_statistics(model):
    vars_in_constraints = variables_in_activated_constraints_set(model)
    fixed_vars_in_constraints = ComponentSet()
    free_vars_in_constraints = ComponentSet()
    free_vars_lb = ComponentSet()
    free_vars_ub = ComponentSet()
    free_vars_lbub = ComponentSet()
    ext_fixed_vars_in_constraints = ComponentSet()
    ext_free_vars_in_constraints = ComponentSet()
    for v in vars_in_constraints:
        if v.fixed:
            fixed_vars_in_constraints.add(v)
            if not _var_in_block(v, model):
                ext_fixed_vars_in_constraints.add(v)
        else:
            free_vars_in_constraints.add(v)
            if not _var_in_block(v, model):
                ext_free_vars_in_constraints.add(v)
            if v.lb is not None:
                if v.ub is not None:
                    free_vars_lbub.add(v)
                else:
                    free_vars_lb.add(v)
            elif v.ub is not None:
                free_vars_ub.add(v)

    # Generate report
    # TODO: Binary and boolean vars
    stats = []
    stats.append(
        f"{TAB}Activated Blocks: {len(activated_blocks_set(model))} "
        f"(Deactivated: {len(deactivated_blocks_set(model))})"
    )
    stats.append(
        f"{TAB}Free Variables in Activated Constraints: "
        f"{len(free_vars_in_constraints)} "
        f"(External: {len(ext_free_vars_in_constraints)})"
    )
    stats.append(f"{TAB * 2}Free Variables with only lower bounds: {len(free_vars_lb)}")
    stats.append(f"{TAB * 2}Free Variables with only upper bounds: {len(free_vars_ub)}")
    stats.append(
        f"{TAB * 2}Free Variables with upper and lower bounds: "
        f"{len(free_vars_lbub)}"
    )
    stats.append(
        f"{TAB}Fixed Variables in Activated Constraints: "
        f"{len(fixed_vars_in_constraints)} "
        f"(External: {len(ext_fixed_vars_in_constraints)})"
    )
    stats.append(
        f"{TAB}Activated Equality Constraints: {len(activated_equalities_set(model))} "
        f"(Deactivated: {len(deactivated_equalities_set(model))})"
    )
    stats.append(
        f"{TAB}Activated Inequality Constraints: {len(activated_inequalities_set(model))} "
        f"(Deactivated: {len(deactivated_inequalities_set(model))})"
    )
    stats.append(
        f"{TAB}Activated Objectives: {len(activated_objectives_set(model))} "
        f"(Deactivated: {len(deactivated_objectives_set(model))})"
    )

    return stats
