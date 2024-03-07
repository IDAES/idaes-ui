README for IDAES-UI docs
=========================

Naming convention for Flowsheet visualizer screenshots
-------------------------------------------------------

Overall pattern: fv-<mode>_<show..>.png

<mode> = top-level mode
  - view
  - diag(nostics)

<show> = which things are shown
   - List in alphabetical order
   - Separate items with "_"
   - Items:
        - di = diagnostic logs
        - fs = flowsheet diagram
        - tr = model tree
        - sl = solver logs
        - tb = stream table


Examples:

- For the default screen which shows the diagram and stream table in view mode:

    fv-view_fs_tb.png

- For the diagnostics mode, showing the solver logs but not model tree

    fv-diag_di_sl.png

