import { PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";
import Flowsheet from "./flowsheet_component/flowsheet_component";
import Flowsheet_variable from "./flowsheet_variables/flowsheet_variable_component";

export default function FlowsheetWrapper(){
  return(
    <>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={20}>
          <Flowsheet />
        </Panel>
        <PanelResizeHandle style={{width: "10px", backgroundColor: "black", marginLeft : "20px", marginRight: "20px"}}/>
        <Panel minSize={30}>
          <Flowsheet_variable />
        </Panel>
      </PanelGroup>
    </>
  )
}