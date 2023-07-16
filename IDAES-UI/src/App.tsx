import { useContext, useRef } from "react";
import { AppContext } from "./context/appMainContext";

import { PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";



import Header from "./components/header_component/header";
import FlowsheetWrapper from './components/flowsheet_main_component/flowsheet_wrapper';
import Table_row from './components/table_row_component/table_row';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

declare var joint: any;
declare var paper: any;

function App() {
  let context = useContext(AppContext);
  // const isShowTable = context.panelState[2].show;

  const canvas:any = useRef(null)

  var namespace = joint.shapes;

        var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: 600,
            height: 100,
            gridSize: 1,
            cellViewNamespace: namespace
        });

        var rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addTo(graph);

        var rect2 = rect.clone();
        rect2.translate(300, 0);
        rect2.attr('label/text', 'World!');
        rect2.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(graph);

  return (
        <>
          <Header/>
          <PanelGroup direction="vertical" style={{height : "80vh"}}>
            <Panel maxSize={90}>
              <FlowsheetWrapper />
            </Panel>
            <PanelResizeHandle style={{width: "10px", height:"5px", backgroundColor: "black", marginLeft : "20px", marginRight: "20px"}}/>
            <Panel maxSize={90}>
              {context.panelState[2].show && <Table_row />}
            </Panel>
          </PanelGroup>

          <div id="myholder"></div>
          <div className="canvas" ref={canvas}></div>
        </>
  )
}

export default App
