# Flowsheet Visualizer

The IDAES Flowsheet Visualizer (FV) is a graphical user interface that displays IDAES *flowsheets* (connected components representing a system or sub-system to be optimized). The FV uses web technologies (HTML, CSS, JavaScript) so is cross-platform.

![Screenshot of the Flowsheet Visualizer](_static/sample_fv.png)

## Usage

An example flowsheet is included and can be viewed with:

```shell
python -m idaes_ui.fv.example
```

To start the FV in an existing model:
* From within a Jupyter Notebook, `flowsheet.visualize("Flowsheet Name")`
* From within a Python script, add a keyword argument if you want the visualizer to keep running: `flowsheet.visualize("Flowsheet Name", loop_forever=True)`
