---
Creator: Dan Gunter
Date: 2023-08-13
---
# Getting Started

The Institute for the Design of Advanced Energy Systems Integrated Platform (IDAES-IP) consists of high-level capabilities that solve complex design and optimization problems with the core IDAES software framework, which makes use of state of the art equation-oriented optimization  solvers. For more details on these components, see the
<a href="https://idaes-pse.readthedocs.io/en/stable/" target="_blank">IDAES documentation</a>

## Installation

### User installation

IDAES-UI is installed as part of the IDAES Integrated Platform (IDAES-IP).
Please see the README of the [IDAES-PSE repository](https://github.com/IDAES/idaes-pse) and/or the full [IDAES install instructions](https://idaes-pse.readthedocs.io/en/stable/tutorials/getting_started/index.html) for details. 

In a nutshell, you want to add *[ui]* to the list of optional dependencies when you run the main IDAES installation command (*pip* or *conda*).
For example: `pip install idaes[ui]`

### Developer installation

If you want to install from the source code (i.e., from a clone of the GitHub repository), then from the root of the cloned repo run: `pip install -r requirements-dev.txt`.
To build this documentation from source in a cloned repo, change to the *docs* directory then run `pip install requirements.txt` followed by `make html` for Linux or MacOSX or `.\make.bat html` for Windows.