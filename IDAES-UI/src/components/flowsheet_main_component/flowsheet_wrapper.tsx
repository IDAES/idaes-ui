import { PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";
import FlowsheetHeader from "./flowsheet_component/flowsheet_header/flowsheet_header_component";
import Flowsheet from "./flowsheet_component/flowsheet_component";
import FlowsheetVariablesHeader from "./flowsheet_variables/flowsheet_variables_header/flowsheet_variables_header";
import Flowsheet_variable from "./flowsheet_variables/flowsheet_variable_component";

export default function FlowsheetWrapper(){
  return(
    <>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={26.1}>
          <FlowsheetHeader />
          <Flowsheet />
        </Panel>
        <PanelResizeHandle className="panelResizeHandle panelResizeHandle_vertical"/>
        <Panel minSize={26.1}>
          <FlowsheetVariablesHeader />
          <Flowsheet_variable />
        </Panel>
      </PanelGroup>
    </>
  )
}