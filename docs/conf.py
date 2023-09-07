import os
import sys

sys.path.insert(0, os.path.abspath(".."))

# Configuration file for the Sphinx documentation builder.
project = "IDAES-UI"
copyright = "2023, Institute for the Design of Advanced Energy Systems Process Systems Engineering Framework"
author = "The IDAES Team"
release = "0.23.6"

extensions = [
    "myst_parser",
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.napoleon",
    "sphinx.ext.viewcode",
]
templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# HTML
html_theme = "sphinx_book_theme"
html_static_path = ["_static"]
html_logo = "_static/logo.png"
html_theme_options = {
    "logo": {"image_light": "_static/logo.png", "image_dark": "_static/logo.png"},
    "repository_provider": "github",
    "repository_url": "https://github.com/IDAES/idaes-ui",
    "use_repository_button": True,
    "path_to_docs": "docs",
}

# MyST
myst_heading_anchors = 3
myst_enable_extensions = [
    "deflist",  # definition lists
]

# Autodoc
autosummary_generate = True

autodoc_default_options = {
    "members": True,
    # The ones below should be optional but work nicely together with
    # example_package/autodoctest/doc/source/_templates/autosummary/class.rst
    # and other defaults in sphinx-autodoc.
    "show-inheritance": True,
    "inherited-members": True,
    "no-special-members": True,
}
