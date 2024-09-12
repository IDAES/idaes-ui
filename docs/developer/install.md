# Developer Installation

## Before installation:

1. The Flowsheet Visualizer UI supports `Python >= 3.8`
1. The Flowsheet Visualizer UI needs `Node.js 18`
1. For best practices, you can create a separate Python environment and install it there

## Installation

If you want to install for development

1. Clone the [GitHub repository](https://github.com/IDAES/idaes-ui)
1. Install python code and python dependency
    1. From the root of the cloned repo run:  
    `pip install -e .`  
    `pip install -r requirements-dev.txt`
1. Install Node.js dependency (Optional)
    1. For install testing dependency from the root of the cloned repo run:  
    `npm install`
    2. For install React dependency Navigate to IDAES-UI folder and run:  
    `npm install`

## Building the docs

For developers, to build this documentation locally:

1) Follow the developer install steps above
2) Change to the *docs* directory and run `pip install requirements.txt` 
3) Run `make html` (Linux or MacOSX) or `.\make.bat html` (Windows)
4) View the docs under `_build/html`

---

## Contact

If you have questions or feedback, please contact the IDAES team through the 
<a href="https://github.com/IDAES/idaes-pse/discussions" _target="blank">Github discussion board</a> 
for the core IDAES-PSE repository.

