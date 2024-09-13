(fv-concepts)=
# {{ vistitle }} Concepts

## Overview

The {{ vistitle }} ({{ visabbr }}) is intended for exploring existing IDAES models. </br>
It will automatically generate a diagram for any model.

---

**Here is an example of the default display:**

![default](/static/fv/fv-view_fs_tb.png){w="100%"}

You can see here the diagram and stream table.

% Additional information can be displayed:
% * Diagnostics
%   * Summary and detailed diagnostic function outputs
% * Model logs
% * Model tree

## Workflow

Currently, the {{ visabbr }} is designed to be run locally, on a user's desktop machine.
Although the interface shows in a web browser, it will be getting its information from the local memory where the model was created and solved.

Because the {{ visabbr }} stays in communication with the Python interpreter that started it, 
if you are running in an interactive Python interpreter -- including a Python console, Jupyter Notebook, or IDE window -- then any subsequent changes to the underlying model (structural or by re-solving) can be reflected in the {{ visabbr }}.

As a corollary, {{ visabbr }} exits with the Python interpreter, so if you are running a script that invokes the {{ visabbr }} at the end to view the results, make sure you don't exit the program; see the [run from a script](#fv-run-script) in the How-to for more details.

---

## Summary of the interactive workflow:

![flow](/static/fv/workflow.png){w="80%" background="transparent"}