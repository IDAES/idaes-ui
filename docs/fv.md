# Flowsheet Visualizer

## Overview

The IDAES Flowsheet Visualizer (FV) is a graphical user interface that displays IDAES *flowsheets* (connected components representing a system or sub-system to be optimized). The FV uses web technologies (HTML, CSS, JavaScript) so is cross-platform.

![Screenshot of the Flowsheet Visualizer](_static/sample_fv.png)

## Usage

### See an example flowsheet
An example flowsheet is included and can be viewed with the following terminal command:

```shell
python -m idaes_ui.fv.example
```

### Visualize your flowsheet
To use the FV to visualize your own flowsheet:
* From within a **Jupyter Notebook**:
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name")
```
* From within a **Python script**, add a keyword argument if you want the visualizer to keep running: 
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name", loop_forever=True)
```
