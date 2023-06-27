# Configuration file for the Sphinx documentation builder.
project = "IDAES-UI"
copyright = (
    "2023, Dan Gunter, Sheng Pang, Cody O'Donnell, Abdelrahman Elbashandy, Sarah Poon"
)
author = "Dan Gunter, Sheng Pang, Cody O'Donnell, Abdelrahman Elbashandy, Sarah Poon"
release = "0.23.6"

extensions = ["myst_parser"]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# HTML
html_theme = "sphinx_book_theme"
html_static_path = ["_static"]

# MyST
myst_heading_anchors = 2
myst_enable_extensions = [
    "deflist",  # definition lists
]
