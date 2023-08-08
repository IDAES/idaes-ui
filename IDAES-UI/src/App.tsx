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
  const { panelState } = useContext(AppContext);
  const isStreamTableShow = panelState.streamTable.show;

  return (
        <main id="main" className="main">
          <Header/>
          <FlowsheetWrapper />
          {/* <PanelGroup direction="vertical">
            <Panel maxSize={100} defaultSize={70}>
              <FlowsheetWrapper />
            </Panel>
            {
              isStreamTableShow &&
              <>
                <PanelResizeHandle className="panelResizeHandle panelResizeHandle_horizontal"/>
                <Panel maxSize={100} defaultSize={30}>
                  {panelState.streamTable.show && <Table_row />}
                </Panel>
              </>
            }
          </PanelGroup> */}
        </main>
  )
}

export default App
