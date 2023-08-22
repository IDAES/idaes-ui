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

## Features
Below is a walk-through of the features of the Flowsheet Visualizer tool.

### Main window
The main window has a diagram panel at the top and a "stream table" panel below it.

![Overview](_static/fv/fv1.png)

### Resize the main panels
You can change the size of each panel with the "resize" tool in the lower right corner.

![Text](_static/fv/fv2.png)

### Zoom the diagram
At the top right are controls that allow zooming in and out for the diagram, as well as "fitting" the diagram in the window.

![Text](_static/fv/fv3.png)

### Manipulate the diagram

#### Move components
You can move the components representing IDAES unit models by clicking and dragging them.

![Text](_static/fv/fvr1.png)

#### Rotate components
If you use the "right click" on a component, it will rotate 90 degrees clockwise.

![Text](_static/fv/fvr2.png)

#### Add elbows to connections
To add additional elbows in a connection between two components, click on the line that connects them.

![Text](_static/fv/fvr3.png)

#### Remove elbows from connections
To remove an elbow in a line, double-click on it.

![Text](_static/fv/fvr4.png)

### Group components
For large and complex diagrams, moving components one at a time can become tedious.
To help, the Flowsheet Visualizer allows you to group elements by dragging a rectangle
around them. Then the selected components can be moved as a group.

![Text](_static/fv/fvg1.png)


### Stream table

#### Hide/show streams
You can select fields to hide/show in the stream table -- particularly useful when you have many streams.

![Text](_static/fv/fvst1.png)
