README for IDAES-UI docs
=========================

Naming convention for Flowsheet visualizer screenshots
-------------------------------------------------------

Overall pattern: fv_<mode>_<show..>.png

<mode> = top-level mode
  - view
  - diag(nostics)

<show> = which things are shown
   - Start each with "@"
   - List in alphabetical order
   - Separate items with "_"
   - Items:
        - diag(nostic logs)
        - flowsheet (diagram)
        - model (tree)
        - stream (table)
        - solver (logs)


Examples:

- For the default screen which shows the diagram and stream table in view mode:

    fv_view_@flowsheet_@stream.png

- For the diagnostics mode, showing the solver logs but not model tree

    fv_diag_@diag_@solver.png

