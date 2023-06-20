---
Title: IDAES UI
Creator: Dan Gunter
Author: The IDAES Project
Date: 2023-03-28
---
<span id="top" />

# IDAES UI

The Institute for the Design of Advanced Energy Systems Integrated Platform (IDAES-IP) consists of high-level capabilities that solve complex design and optimization problems with the core IDAES software framework, which makes use of state of the art equation-oriented optimization  solvers. For more details on these components, see the [IDAES documentation](https://idaes-pse.readthedocs.io/en/stable/). 

This documentation is for *user interface* components that build on top of the IDAES core Python library and applications. This documentation is for all users; additional information relevant for software developers of the IDAES platform will be prefixed with "💻Developers".

Sections:

* [Getting started](#getting-started) - Install the software
* [Flowsheet Visualizer](#fv) - Visualize flowsheet layout and properties.

<span id="getting-started" />

---

## **Getting Started**
### **Install IDAES PSE:**

*This package depends on IDAES-PSE. To run this package you must first install IDAES-PSE.*

<a href="https://idaes-pse.readthedocs.io/en/stable/tutorials/getting_started/index.html#installation" target="_blank">
  Installation instruction
</a>

<br>

### **Install IDAES-UI:**
### **Option 1:** Installing from PyPI 
```sh
pip install idaes-ui
```
### **Option 2:** Installing from the Git Repository
```
pip install "git+https://github.com/IDAES/idaes-ui"
```

<br>

### **Run example:**
```sh
python -m idaes_ui.fv.example
```
*This example comes with this package; it is not part of the IDAES Examples. If you want to use the IDAES Examples, please follow the instructions below.*

<br>

<!-- 
Leave this part out it should be in the install idaes docs.

### **Install IDAES Examples:**

*If you want to run IDAES Examples with this package, you have to install IDAES Examples.*

<a href="https://github.com/IDAES/examples#readme" target="_blank">
  Installation instruction
</a>

---- -->

<br>

## **💻Developers**: 
<!-- To install the UI components from GitHub, follow the procedures outlined in the IDAES-IP [Advanced User Installation](https://idaes-pse.readthedocs.io/en/latest/tutorials/advanced_install/index.html) section to set up your environment. Then you should fork and clone the [idaes/idaes-ui](https://github.com/IDAES/idaes-ui.git) repository and install it with:  -->

### **Please following advanced installation:**

<a href="https://idaes-pse.readthedocs.io/en/stable/tutorials/advanced_install/index.html" target="_blank">
  Advanced User Installation
</a>

<br/>

Fork and clone the [idaes/idaes-ui](https://github.com/IDAES/idaes-ui.git) repository, and go to the IDAES-UI folder you just cloned.

<br>

### **Run the pip command for local installation.**
```sh
pip install -e .
```

<br>

### **Run example:**
```sh
python -m idaes_ui.fv.example
```

<!-- 
leave this part, and wait on proper Sphinx docs

<br>

### **Install IDAES Examples:**

*If you want to run IDAES Examples with this package, you have to install IDAES Examples.*

<a href="https://github.com/IDAES/examples#readme" target="_blank">
  Installation instruction
</a> -->

----

<span id="fv" />

## Flowsheet Visualizer

Screenshot of the Flowsheet Visualizer:

<img src="sample_fv.png" style="width:50vw"/>

The IDAES-IP [Flowsheet Visualizer](#flowsheet-visualizer) (FV) is a graphical user interface that displays complex *flowsheets* (connected components representing a system or sub-system to be optimized) created with the IDAES-IP Python core software. The FV uses web technologies (HTML, CSS, JavaScript) so is cross-platform and has identical functionality on computers running Windows, Mac, and UNIX.

---

**FV Sections:** [Tutorials](#fv-tutorials) | [How-to](#fv-howto) | [Reference](#fv-reference)

---

<span id="fv-tutorials" />

### **Tutorials:**
Please check IDAES Flowsheet Visualizer documentation:

<a href="https://idaes-pse.readthedocs.io/en/stable/how_to_guides/vis/index.html" target="_blank">
IDAES Flowsheet Visualizer
</a>

<span id="fv-reference" />

---

**Reference:**

See the [visualize()](https://github.com/IDAES/idaes-ui/blob/main/idaes_ui/fv/fsvis.py) function code for documentation on its options and behavior. 



