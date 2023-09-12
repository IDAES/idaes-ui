# Installation

Below are installation instructions for installing IDAES UIs.
More details on overall IDAES installation and usage 
are on the [IDAES documentation](https://idaes-pse.readthedocs.io/en/stable/) site.

## User installation

If you want to use the UIs (not develop new code),
then use `pip` to install the software as part of the 
IDAES Integrated Platform (IDAES-IP).

```shell
pip install "idaes-pse[ui]"
```

## Developer installation

If you want to install for development

1) Clone the [GitHub repository](https://github.com/IDAES/idaes-ui)
2) From the root of the cloned repo run: `pip install -r requirements-dev.txt`

### Building the docs

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

