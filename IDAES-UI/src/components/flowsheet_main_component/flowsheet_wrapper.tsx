import { useContext, useEffect } from "react";
import {AppContext} from "../../context/appMainContext";

import { PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";
import FlowsheetHeader from "./flowsheet_component/flowsheet_header/flowsheet_header_component";
import Flowsheet from "./flowsheet_component/flowsheet_component";
import FlowsheetVariablesHeader from "./flowsheet_variables/flowsheet_variables_header/flowsheet_variables_header";
import Flowsheet_variable from "./flowsheet_variables/flowsheet_variable_component";
import StreamTable from "./stream_table_component/stream_table";

import { MainFV } from "./flowsheet_component/flowsheet_functions/mainFV";

export default function FlowsheetWrapper(){
  let {server_port} = useContext(AppContext);
  const {panelState} = useContext(AppContext);
  const isFvShow:boolean = panelState.fv.show;
  const isVariablesShow:boolean = panelState.variables.show;
  const isStreamTableShow = panelState.streamTable.show;

  useEffect(()=>{
    //get server port base on UI port number, vite running on 5173 on dev
    server_port == "5173" ? server_port ="8099" : server_port = server_port;
    //when template loaded then render flowsheet, variable, stream table to page with minFV class.
    new MainFV("sample_visualization", server_port, isFvShow, isVariablesShow, isStreamTableShow)
  },[isFvShow, isStreamTableShow])

  return(
    <>
      <PanelGroup direction="vertical">
        <Panel maxSize={100} defaultSize={70}>
          <PanelGroup direction="horizontal">
            {
              isFvShow && 
              <Panel defaultSize={70} minSize={0}>
                <FlowsheetHeader />
                <Flowsheet />
              </Panel>
            }
            
            {/*this part closed because the variable part is not in this round of release*/}
            {/* <PanelResizeHandle className="panelResizeHandle panelResizeHandle_vertical"/> */}
            {
              // isVariablesShow && 
              // <Panel defaultSize={30} minSize={0}>
              //   <FlowsheetVariablesHeader />
              //   <Flowsheet_variable />
              // </Panel>
            }
          </PanelGroup>
        </Panel>
            
        <PanelResizeHandle className="panelResizeHandle panelResizeHandle_horizontal"/>

        {
          isStreamTableShow &&
          <Panel maxSize={100} defaultSize={30}>
            <StreamTable />
          </Panel>
        }
        
      </PanelGroup>
    </>
  )
}