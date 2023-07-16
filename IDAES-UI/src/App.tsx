import { useContext } from "react";
import { AppContext } from "./context/appMainContext";

import { PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";



import Header from "./components/header_component/header";
import FlowsheetWrapper from './components/flowsheet_main_component/flowsheet_wrapper';
import Table_row from './components/table_row_component/table_row';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  let context = useContext(AppContext);
  // const isShowTable = context.panelState[2].show;

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
        </>
  )
}

export default App
