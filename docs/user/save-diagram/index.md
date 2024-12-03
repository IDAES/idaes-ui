(save-preview-diagram)=
# Save and Preview Diagram  

### Overview:  
As we know, you can use IDAES UI to open a web page in your browser and view the diagram image by using:
```python
m.fs.visualize('flowsheet_name')
```
The `visualize` function returns a call back function named `save_diagram`
This function allows you to:
1. Preview the most current stage of the diagram image.
2. Save the most current stage of the diagram image (SVG, PNG) to your defined path.

### Usage:
1. Call the `visualize` function without opening the browser by adding the parameter `browser=False` and assign the result to a variable.
```python
visualization_dict = m.fs.visualize('flowsheet_name', browser=False)
```

2. Call the `save_diagram` function from visualization_dict.  

Arguments are:
 * `screenshot_name`: string (Optional) — The name of the screenshot you would like to use. If not assigned, the flowsheet name will be used as the default.
 * `image_type`: string (Optional) — The type of image you would like to save. Currently, it only supports PNG and SVG. If not specified, it will use SVG as the default.
 * `screenshot_save_to`: str (Optional) — The path where you would like to save the diagram screenshot. If not specified, it will save to the IDAES-UI package/screenshots by default.
 * `display`: boolean (Optional) — A flag to control whether to display in Jupyter or not. If not specified, it will default to `False`.

```python
visualization_dict.save_diagram(
    screenshot_name='my_diagram', 
    image_type='svg', 
    screenshot_save_to='~/user/screenshots', 
    display=True
)
```

3. You should now see the saved diagram screenshot image in your defined `screenshot_save_to` path, with the specified `image_type`. If `display` is set to `True`, you should also see the diagram image displayed in the Jupyter Notebook.



