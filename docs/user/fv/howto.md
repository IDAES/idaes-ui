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

(fv-run-script)=
### Run from within a Python script
Add a keyword argument so the Python interpreter keeps running and the {{ visabbr }} can still communicate with its backend: 
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name", loop_forever=True)
```

## Select panels to view

The default view is shown below. Note the minimize buttons (![default](/static/fv/btn-minimize.png)) at the right of each panel.

![default](/static/fv/fv-view_fs_tb.png){w="80%"}

If you click on the minimize button for the stream table, it goes away and a small
button appears under the top bar labeled `Stream Table+`.

![stream_table_minimized](/static/fv/fv-view_fs.png){w="80%"}

If you click on the minimize button for the diagram, only the title bar will show!

![all_minimized](/static/fv/fv-view.png){w="80%"}

You can restore the panels by clicking on the `{Panel Name}+` buttons.

