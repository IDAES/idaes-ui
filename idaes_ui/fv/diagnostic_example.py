"""
Simple diagnostics example
"""
from pyomo.environ import ConcreteModel, Block, Var, Constraint, units, SolverFactory
from idaes.core.util import DiagnosticsToolbox
from idaes_ui.fv import visualize

__author__ = "Andrew Lee, Dan Gunter"


def build() -> Block:
    m = ConcreteModel()

    m.v1 = Var(units=units.m)
    m.v2 = Var(units=units.m)
    m.v3 = Var(bounds=(0, 5))
    m.v4 = Var()
    m.v5 = Var(bounds=(0, 5))
    m.v6 = Var()
    m.v7 = Var(
        units=units.m, bounds=(0, 1)
    )  # Poorly scaled variable with lower bound
    m.v8 = Var()  # unused variable

    m.c1 = Constraint(expr=m.v1 + m.v2 == 10)  # Unit consistency issue
    m.c2 = Constraint(expr=m.v3 == m.v4 + m.v5)
    m.c3 = Constraint(expr=2 * m.v3 == 3 * m.v4 + 4 * m.v5 + m.v6)
    m.c4 = Constraint(expr=m.v7 == 2e-8 * m.v1)  # Poorly scaled constraint

    m.v4.fix(2)
    m.v5.fix(2)
    m.v6.fix(0)

    return m


def solve(m: Block):
    # Model is trivially pre-solvable - turn off
    solver = SolverFactory("ipopt")
    solver.solve(m)


def report(dt):
    dt.report_structural_issues()
    dt.report_numerical_issues()


if __name__ == "__main__":
    model = build()
    solve(model)

    dt = DiagnosticsToolbox(model)
    report(dt)

    visualize(model, loop_forever=True)
