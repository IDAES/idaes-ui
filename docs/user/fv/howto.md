(fv-howto)=
# Flowsheet Visualizer How-to

## See an example flowsheet
An example flowsheet is included and can be viewed with the following terminal command:

```shell
python -m idaes_ui.fv.example
```

## Visualize your flowsheet
To use the FV to visualize your own flowsheet:

(fv-run-ide)=
### Run from within an interactive environment, including a Jupyter Notebook
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name")
```

(fv-run-script)=
### Run from within a Python script
Add a keyword argument so the Python interpreter keeps running and the FV can still communicate with its backend: 
```python
# create the flowsheet and put in variable 'flowsheet'
flowsheet.visualize("Flowsheet Name", loop_forever=True)
```
