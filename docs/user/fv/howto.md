(fv-howto)=
# {{ vistitle }} How-to

## See an example flowsheet
An example flowsheet is included and can be viewed with the following terminal command:

```shell
python -m idaes_ui.fv.example
```

## Visualize your flowsheet
To use the {{ visabbr }} to visualize your own flowsheet:

(fv-run-ide)=
### Run from within an interactive environment, including a Jupyter Notebook
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name")
```
---

(fv-run-script)=
### Run from within a Python script
Add a keyword argument so the Python interpreter keeps running and the {{ visabbr }} can still communicate with its backend: 
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name", loop_forever=True)
```

(fv-function-params)=
### Params for visualize function
```Python
visualize(
    flowsheet, 
    name: str, 
    save: Optional[Union[Path, str, bool]], 
    load_from_saved: bool, 
    save_dir: Optional[Path],
    save_time_interval:int,
    overwrite: bool,
    browser: bool,
    port: Optional[int],
    quiet: bool,
    loop_forever: bool
)
```

---

(fv-overview)=
## {{ visabbr }} overview
![fv-overview](/static/fv/fv-overview-diagnostic-open.png){w="100%"}

### Flexible panel
The FV uses flexible panels, allowing you to change the panel location and resize each panel by dragging them. After adjusting the panels, your settings are saved, and the next time you open FV, it will display the same layout.

```{video} /static/fv/videos/fv-overview-resize-drag-panel.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

### Including panels:
{{ visabbr }}  contains multiple panels for different purposes, including:
* [FV Header](header-detail)
* [Diagram panel](diagram-panel-detail) 
* [Stream table panel](stream-table-detail) 
* [Diagnostics panel](diagnostic-detail)

(header-detail)=
## {{ visabbr }} UI Header
![fv-header-overview](/static/fv/fv-header.png){w="100%"}
The FV header contains general information and general-purpose function buttons, including:
* [Diagnostics panel toggle button](diagnostics-toggle)
* [Flowsheet name](flowsheet-name)
* [Refresh button](refresh)
* [Save](save)
* [Reset Layout button](reset-layout)
* [Help](help)

(diagnostics-toggle)=
### Diagnostic panel toggle button
The diagnostics toggle button use for turn on or turn off the Diagnostics panel.

```{video} /static/fv/videos/fv-toggle-diagnostics-panel.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```
---

(flowsheet-name)=
### Flowsheet name
The flowsheet name section will display the name of your flowsheet, when you 
```python
flowsheet.visualize("your_flowsheet_name")
```
The defined flowsheet name will be displayed here.

![fv-header-flowsheet-name](/static/fv/fv-header-flowsheet-name.png){w="100%"}

---

(refresh)=
### Refresh button
When you make changes to your flowsheet model, you can click the refresh button to update the diagram.

---

(save)=
### Save button
By clicking the save button, you can save your diagram as a JSON file for future use.

Additionally:
1. When you have changes on diagram the diagram will be auto saved.
1. The default auto-save interval is set to 5 seconds, but you can change it when you call the visualize().
    ```python
        flowsheet.visualize(name="flowsheet", save_time_interval=10)
    ```
---

(reset-layout)=
### Reset Layout button
The FV supports a flexible layout, which means you can change the panel size and location. If you want to revert to the default layout, simply click the `Reset Layout` button.

```{video} /static/fv/videos/fv-reset-layout.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(help)=
### Help
If you want more detailed information, you can click the Detail button, which will redirect you to the IDAES documentation page in a new browser tab.

(diagram-panel-detail)=
## Diagram panel
![diagnostic-panel-overview](/static/fv/fv-diagram-panel.png){w="100%"}
The diagram panel is where your diagram will be rendered, and all the controls for the diagram are contained in the header of this panel.

* [Zoom In and Zoom out](zoom-in-and-out)
* [Zoom to Fit](zoom-to-fit)
* [Toggle stream names and labels](toggle-stream-name-and-labels)
* [Download diagram as SVG or PNG](download-diagram-as-image)
* [Rotate component](rotate-component)
* [multiple-selection](multiple-selection)

[Back to overview](fv-overview)

(zoom-in-and-out)=
### Zoom in and zoom out:
By clicking the zoom in and zoom out buttons on the diagram header, you can control the zoom level of your diagram.

```{video} /static/fv/videos/fv-zoom.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```
---

(zoom-to-fit)=
### Zoom to fit:  
When you want your diagram to transform to a size that fits in the diagram panel, simply click the Zoom to Fit button on the diagram header.

```{video}  /static/fv/videos/fv-zoom-to-fit.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(toggle-stream-name-and-labels)=
### Toggle stream name and labels:  
By hover the eye icon the drop down menu will shows up, you can easily toggle stream names or labels on and off by click on the option in the menu.

```{video}  /static/fv/videos/fv-toggle-stream-labels.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(download-diagram-as-image)=
### Download diagram as SVG or PNG image:  
By hovering over the download icon in the top right corner of the diagram header bar, the drop-down menu will appear, containing options for the type of image you would like to download. By clicking on the image type, you can easily download your diagram to your computer in the selected format.

```{video}  /static/fv/videos/fv-download-diagram.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(rotate-component)=
### Rotate component:  
Move your cursor over the component you want to rotate, right-click on it, and then you can rotate the component.

```{video}  /static/fv/videos/fv-rotate-component.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(multiple-selection)=
### Select multiple components:  
Move your cursor over the diagram panel, then hold down the left mouse button and simply drag over the components you want to select to choose multiple components.

```{video}  /static/fv/videos/fv-multiple-selection.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(stream-table-detail)=
## Stream table
* [Stream table overview](stream-table-overview)
* [Reorder data in stream table](reorder-data-in-stream-view)
* [Toggle stream table column](toggle-stream-table-column)

(stream-table-overview)=
### Stream panel overview

The stream table panel contains data from your flowsheet model, allowing you to view and reorder the data as needed. The stream table panel also shares space with the diagnostics tool; when the diagnostics tool is enabled, you can simply click Diagnostics Logs or Stream Table to toggle between them.

![stream-table-overview-image](/static/fv/fv-stream-table-overview.png){w="100%"}

---

(reorder-data-in-stream-view)=
### Reorder data in stream table

You can reorder the stream table by clicking on a data column and dragging it to a new position.

```{video}  /static/fv/videos/fv-stream-table-reorder.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(toggle-stream-table-column)=
### Toggle stream table column

You can click the Hide Fields button located in the Stream Table header to open a drop-down menu. By clicking on a column name listed in the drop-down menu, you can toggle the visibility of the stream table columns.

```{video}  /static/fv/videos/fv-stream-table-hide-column.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(diagnostic-detail)=
## Diagnostics tool
* [Diagnostics tool overview](diagnostics-tool-overview)
* [Enable diagnostics tool](enable-diagnostics-tool)
* [Run diagnostics in FV](run-diagnostics-in-fv)

(diagnostics-tool-overview)=
### Diagnostics tool overview

The {{ visabbr }} also includes the `IDAES Diagnostics tool`. which helps you diagnose your flowsheet model.

![diagnostics panel overview](/static/fv/fv-diagnostics-panel-overview.png){w="100%"}


---

(enable-diagnostics-tool)=
### Enable diagnostics tool

By clicking the Diagnostics toggle button located in the {{ visabbr }} header, you can easily open and close the Diagnostics tool.

```{video}  /static/fv/videos/fv-toggle-diagnostics-panel.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

---

(run-diagnostics-in-fv)=
### Run diagnostics in fv

To run the diagnostics for the suggested next step in FV, simply click the `run` button located on the right side of the suggested next step function name. After running the suggested next step, the log will be displayed in the Diagnostics Logs panel.


```{video}  /static/fv/videos/fv-diagnostics-run-suggested-next-step.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

If you want to run your diagnostics next step in a code editor or Jupyter notebook, simply click the `Copy` button located next to the `Run` button to copy the next step function name, then paste it into the code editor to run it.

```{video}  /static/fv/videos/fv-diagnostics-next-steps-open-in-jupyter.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```

Additionally:  
If there is an error in your flowsheet model, it will also be displayed in the Diagnostics Logs panel.