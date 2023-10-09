# IDAES FLOWSHEET VISUALIZER

## For developers
The directory structure follows established conventions for typical medium-sized Flask apps:

````
/fsvis
    /static
        /images
            /icons
    /templates
````

 - The directory `fsvis` contains all python relevant to the `fsvis` module, as well
as source files for running the Flask server used by said module.
 
 - The directory `static` contains all files that are to be used directly by the app
i.e. images, javascript, and any html intended to be served as-is.


### [WIP] Diagnostics API wrappers

The code for the diagnostics wrappers is in the `idaes_ui.fv.models` package.
There is a `cli` module that has a simple interface to show an example of the JSON. You can run it with:
```
python -m idaes_ui.fv.models.cli
```
Add `-h` to the command above to see available options.
