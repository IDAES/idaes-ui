"""
CLI utility for looking at sample output from the models.

# to see options:
python -m idaes_ui.fv.models.cli -h

# to run:
python -m idaes_ui.fv.models.cli [..options..]

"""
__author__ = "Dan Gunter"
__created__ = "2023-10-08"

import argparse
import json
import sys
from . import DiagnosticsData


def print_sample_output(output_file, indent=False, solve=True, schema=False):
    from idaes_ui.fv.tests.flowsheets import idaes_demo_flowsheet

    flowsheet = idaes_demo_flowsheet()
    if solve:
        flowsheet.solve()
    data = DiagnosticsData(flowsheet)

    output_file.write(data.model_dump_json(indent=indent))

    if schema:
        output_file.write("\n----\n")
        json.dump(
            data.model_json_schema(mode="serialization"), output_file, indent=indent
        )


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("-f", "--file", help="Output file (default=stdout)")
    p.add_argument("-i", "--indent", help="indent JSON", action="store_true")
    p.add_argument("-n", "--no-solve", help="do not solve model", action="store_true")
    p.add_argument("-s", "--schema", help="also print JSON schema", action="store_true")
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
    print_sample_output(
        ofile, indent=args.indent, solve=not args.no_solve, schema=args.schema
    )
    if ofile is not sys.stdout:
        print(f"\nWrote output to file: {args.file}")
