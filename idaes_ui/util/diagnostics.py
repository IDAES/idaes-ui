"""
Wraps the functions of the IDAES core model diagnostics
for easier consumption and use by the UI layer.
"""

__author__ = "Dan Gunter"
__created__ = "2023-09-05"

import argparse
import re
import sys
from typing import Dict, Union

from pydantic import BaseModel, computed_field

# Import IDAES functionality (use shortened names, i=IDAES m=model)
from idaes.core.util import model_statistics as ims
from idaes.core.util import model_diagnostics as imd
from idaes.core.util.scaling import get_jacobian, jacobian_cond

# Import other needed IDAES types
from pyomo.core.base.block import _BlockData


# model_statistics module
# -----------------------


class StatisticsUpdateError(Exception):
    def __init__(self, details=None):
        msg = f"Statistics update failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


# List of (attribute-name, display-name) for model statistics
statistics_index = (
    ("dof", "Degrees of Freedom", "Number of degrees of freedom"),
    ("num_var", "Num Var", "Total number of variables"),
    ("num_var_fixed", "Num Fixed Var", "Number of fixed variables"),
    ("num_var_unused", "Num Unused Var", "Number of unused variables"),
    (
        "num_var_fixed_unused",
        "Num Unused Fixed Var",
        "Number of unused fixed variables",
    ),
    ("num_var_ineq", "Num Var Ineq", "Number of variables used only in inequalities"),
    (
        "num_var_fixed_ineq",
        "Num Fixed Var Ineq",
        "Number of fixed variables used only in inequalities",
    ),
    ("num_constr", "Num Constr", "Total number of constraints"),
    ("num_constr_eq", "Num Eq Constr", "Number of equality constraints"),
    (
        "num_constr_deact_eq",
        "Num Eq Constr Deact",
        "Number of equality constraints (deactivated)",
    ),
    ("num_obj", "Num Obj", "Number of objectives"),
    ("num_obj_deact", "Num Obj Deact", "Number of objectives (deactivated)"),
    ("num_block", "Num Block", "Number of blocks"),
    ("num_block_deact", "Num Block Deact", "Number of blocks (deactivated)"),
    ("num_expr", "Num Expr", "Number of expressions"),
)


class ModelStatistics(BaseModel):
    """Interface to the IDAES `model_statistics` module."""

    # variables
    dof: int = 0  # degrees of freedom
    num_var: int = 0
    num_var_fixed: int = 0
    num_var_unused: int = 0
    num_var_fixed_unused: int = 0
    num_var_ineq: int = 0
    num_var_fixed_ineq: int = 0
    # constraints/objectives
    num_constr: int = 0
    num_constr_eq: int = 0
    num_constr_deact_eq: int = 0
    num_constr_ineq: int = 0
    num_constr_deact_ineq: int = 0
    num_obj: int = 0
    num_obj_deact: int = 0
    # blocks
    num_block: int = 0
    num_block_deact: int = 0
    # expressions
    num_expr: int = 0

    def __init__(self, block: _BlockData):
        super().__init__()
        self._block = block
        self.update()

    def update(self):
        """Update values in report."""
        b = self._block
        try:
            # variables
            self.dof = ims.degrees_of_freedom(b)
            self.num_var = ims.number_variables(b)
            self.num_var_fixed = ims.number_fixed_variables(b)
            self.num_var_unused = ims.number_unused_variables(b)
            self.num_var_fixed_unused = ims.number_fixed_unused_variables(b)
            self.num_var_ineq = ims.number_variables_only_in_inequalities(b)
            self.num_var_fixed_ineq = ims.number_fixed_variables_only_in_inequalities(b)
            # constraints / objectives
            self.num_constr = ims.number_total_constraints(b)
            self.num_constr_ineq = ims.number_total_equalities(b)
            self.num_constr_deact_eq = ims.number_deactivated_equalities(b)
            self.num_constr_ineq = ims.number_total_inequalities(b)
            self.num_constr_deact_ineq = ims.number_deactivated_inequalities(b)
            self.num_obj = ims.number_total_objectives(b)
            self.num_obj_deact = ims.number_deactivated_objectives(b)
            # blocks
            self.num_block = ims.number_total_blocks(b)
            self.num_block_deact = ims.number_deactivated_blocks(b)
            # expressions
            self.num_expr = ims.number_expressions(b)
        except Exception as e:
            raise StatisticsUpdateError()


# model_diagnostics module
# ------------------------

# List of (attribute-name, display-name, description) for diagnostics
diagnostics_index = (
    ("structural_issues", "Structural issues", "List of structural issues with model"),
    ("numerical_issues", "Numerical issues", "List of numerical issues with model"),
)


class DiagnosticsError(Exception):
    def __init__(self, name, details=None):
        msg = f"Diagnostic '{name}' failed"
        if details:
            msg += f": {details}"
        super().__init__(msg)


class StructuralIssues(BaseModel):
    """Structural issues with a model."""

    warnings: list[str]
    cautions: list[str]
    next_steps: list[str]


class NumericalIssues(BaseModel):
    warnings: list[str]
    cautions: list[str]
    next_steps: list[str]
    jacobian_cond: float


class ModelDiagnosticsRunner:
    """Interface to the IDAES `model_diagnostics` module."""

    def __init__(self, block: _BlockData, **kwargs):
        self.block = block
        self.tb = imd.DiagnosticsToolbox(block, **kwargs)

    _warnings_expr = re.compile(r"WARNING:\s+(.*)")
    _cautions_expr = re.compile(r"Caution:\s+(.*)")

    def _clean_messages(self, warnings, cautions):
        """Remove useless prefixes from messages"""
        cleaned_warnings = []
        for item in warnings:
            m = self._warnings_expr.match(item)
            cleaned_warnings.append(m.group(1) if m else item)
        cleaned_cautions = []
        for item in cautions:
            m = self._cautions_expr.match(item)
            cleaned_cautions.append(m.group(1) if m else item)
        return cleaned_warnings, cleaned_cautions

    @property
    def structural_issues(self) -> StructuralIssues:
        """Compute and return structural issues with the model."""
        try:
            warnings, next_steps = self.tb._collect_structural_warnings()
            cautions = self.tb._collect_structural_cautions()
        except Exception as e:
            raise DiagnosticsError(
                "structural_issues", details=f"while getting warnings and cautions: {e}"
            )
        warnings, cautions = self._clean_messages(warnings, cautions)
        return StructuralIssues(
            warnings=warnings, cautions=cautions, next_steps=next_steps
        )

    @property
    def numerical_issues(self) -> NumericalIssues:
        """Compute and return numerical issues with the model."""
        try:
            jac, nlp = get_jacobian(self.block, scaled=False)
        except Exception as e:
            raise DiagnosticsError(
                "numerical_issues", details=f"while getting jacobian: {e}"
            )
        try:
            warnings, next_steps = self.tb._collect_numerical_warnings(jac=jac, nlp=nlp)
            cautions = self.tb._collect_numerical_cautions(jac=jac, nlp=nlp)
        except Exception as e:
            raise DiagnosticsError(
                "numerical_issues", details=f"while getting warnings and cautions: {e}"
            )
        warnings, cautions = self._clean_messages(warnings, cautions)
        return NumericalIssues(
            warnings=warnings,
            cautions=cautions,
            next_steps=next_steps,
            jacobian_cond=jacobian_cond(jac=jac, scaled=False),
        )


class DiagnosticsData(BaseModel):
    """The standard set of diagnostics data for a flowsheet
    """
    meta: dict = {
        "statistics": statistics_index,
        "diagnostics": diagnostics_index
    }

    def __init__(self, block: _BlockData):
        super().__init__()
        self._ms = ModelStatistics(block)
        self._md = ModelDiagnosticsRunner(block)

    @computed_field
    @property
    def statistics(self) -> ModelStatistics:
        return self._ms

    @computed_field
    @property
    def structural_issues(self) -> dict:
        return self._md.structural_issues.model_dump()

    @computed_field
    @property
    def numerical_issues(self) -> dict:
        return self._md.numerical_issues.model_dump()


def print_sample_output(output_file, indent=False, include_meta=False):
    from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet

    flowsheet = idaes_demo_flowsheet()
    data = DiagnosticsData(flowsheet)

    kwargs: Dict[str, Union[str, int]] = {}
    if indent:
        kwargs["indent"] = 2
    if not include_meta:
        kwargs["exclude"] = "meta"

    if output_file is sys.stdout:
        json = data.model_dump_json(**kwargs)
        print("-- OUTPUT --")
        print(json)
    else:
        output_file.write(data.model_dump_json(**kwargs))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("-f", "--file", help="Output file (default=stdout)")
    p.add_argument("-i", "--indent", help="indent JSON", action="store_true")
    p.add_argument("-m", "--meta", help="Include metadata", action="store_true")
    args = p.parse_args()
    # choose output stream
    if args.file:
        try:
            ofile = open(args.file, "w")
        except IOError as e:
            print(f"Failed to open output file '{args.file}': {e}")
            sys.exit(-1)
    else:
        ofile = sys.stdout

    # create output
    print_sample_output(ofile, indent=args.indent, include_meta=args.meta)
    if ofile is not sys.stdout:
        print(f"\nWrote output to file: {args.file}")
