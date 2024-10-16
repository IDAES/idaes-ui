# {{ vistitle }} for Developers

## Start {{ visabbr }} example
After installation you can start to run the flowsheet visualizer example by run:

```python
python -m idaes_ui.fv.example
```

If you have Node.js 18 installed you can also run:
```bash
npm run ui
```

## Code structure
### Python part:
The Python code is responsible for backend tasks, such as starting the HTTP server, converting the flowsheet model to a JSON file, etc.

All files related to the FV on the Python side are located in `repo_root/idaes_ui/fv/`

Includes: 
1. FV visualizer
1. FV backend server
1. FV flowsheet
1. FV diagnostics
1. FV settings
1. FV example
1. FV test

### UI part
The JS code is responsible for frontend tasks and handles browser-side UI rendering. It uses React and Node.js to generate a modern single-page application.

All UI files are loaded in `repo_root/IDAES-UI/`

---

## How to make changes

### Make change in backend
You can start {{ visabbr }} with `pip install -e .` ,  Once {{ visabbr }} successfully started, you can make direct changes to the code and save to apply your changes.

### Make change in frontend
1. Navigate to `repo_root/IDAES-UI/`
2. Make sure you have `Node.js 18` installed, and then run `npm install`
3. Run `vite run dev` command to start the frontend development server in the browser.

Attention:  
The frontend UI development environment requires the Python backend server to be started and running, or the API calls will fail, and the diagram will not display in the browser.

### Build React
The changes you make in the `IDAES-UI` folder are only for the development environment. To apply your changes to FV, you need to run the `npm run build` command.


## Learn more about IDAES UI:
Currently there is one IDAES UI, the {{ vistitle }} ({{ visabbr }}).
The architecture and design of the {{ visabbr }} uses a pattern that is shared
across other UIs in other Advanced Process Systems Engineering applications
based on the IDAES Integrated Platform (IDAES-IP), e.g. WaterTAP and PARETO.
The basics of this design are illustrated below.
The main goal of a common design is to enable web applications that can be
run on the desktop by an individual user or as a service across users.
A secondary goal is to build a common set of front-end and 
back-end UI support libraries that can unify and accelerate application
development across the IDAES-IP.
