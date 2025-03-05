(save-preview-diagram)=
# Save and Preview Flowsheet Diagram  

### Overview:  
IDAES UI allows you to preview your flowsheet diagram at any time while working on it by calling `export_flowsheet_diagram`.

### Usage:
The export_flowsheet_diagram function is used to return the current view of the flowsheet diagram at any time after you have initialized your model.
* It can save the diagram to your preferred path or the default path.
* It can display the current view of the flowsheet diagram in a Jupyter Notebook.

### Parameters:
`export_flowsheet_diagram` takes three parameters:
* `flowsheet`: The flowsheet object
* `name`: The diagram filename or full path where you prefer to save the diagram. The output format is determined by the file extension (".svg" for SVG and ".png" for PNG).
* `display`: Boolean, to determent if you want to review current flowsheet in jupyter notebook

#### Let's go over it step by step.
1. Import `export_flowsheet_diagram` function from `idaes_ui` package
    ```python
    from idaes_ui.fv.fsvis import export_flowsheet_diagram
    ```
2. Create your model. Here we assume the model is called `m` and
   the top-level flowsheet that you want to view is `m.fs`.

3. After initializing your model, you should have `m.fs`.   
Then, you can call `export_flowsheet_diagram`.
    ```python
    export_flowsheet_diagram(m.fs, '~/Download/my_flowsheet_diagram.svg', display=True)
    ```

4. Then, you can see the flowsheet diagram's saved path in the log.

### View flowsheet diagram
1. To view the image, after calling `export_flowsheet_diagram`, you can visit the path shown in the log.
2. To view the flowsheet diagram in a Jupyter Notebook, set `display=True`. This will automatically display the flowsheet diagram in the notebook.

### Demo
```{video} /static/save_diagram/videos/demo_video_export_flowsheet_diagram.mp4
:width: 800
:nocontrols:
:autoplay: true
:loop:
```