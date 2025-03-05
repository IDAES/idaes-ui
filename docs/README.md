README for IDAES-UI docs
=========================


### Merge and build
* When merging changes to IDAES-UI, the CI will automatically run and build the documentation to the online server.

### Run as developer
```bash
# Change to the docs directory

# Install the required packages
pip install -r requirements.txt

# Install sphinx-autobuild
# This is necessary for building a local development server to view live changes.
pip install sphinx-autobuild

# Run the live server using Sphinx-autobuild.
sphinx-autobuild . _build/html
```