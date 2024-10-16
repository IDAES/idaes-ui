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
    "sphinxcontrib.video",
]
templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store", ".pytest_cache"]

# HTML
static_dir = "static"
html_theme = "sphinx_book_theme"
html_static_path = [static_dir]
html_logo = "static/logo.png"
html_theme_options = {
    "logo": {
        "image_light": f"{static_dir}/logo.png",
        "image_dark": f"{static_dir}/logo.png",
    },
    "repository_provider": "github",
    "repository_url": "https://github.com/IDAES/idaes-ui",
    "use_repository_button": True,
    "path_to_docs": "docs",
}

# MyST
myst_heading_anchors = 6
myst_enable_extensions = [
    "deflist",  # definition lists
    "attrs_inline",  # inline attributes on images using MD syntax
    "substitution",  # for global substitutions; see myst_substitutions
]
myst_substitutions = {
    # Change these two lines to rename the Flowsheet Visualizer (!)
    "vistitle": "Flowsheet Visualizer",
    "visabbr": "FV",
    "mov": "mov",
    "mp4": "mp4",
    "video-width": 800,
}

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
