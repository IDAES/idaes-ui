import { createContext, useState, ReactNode, useEffect } from "react";
import axios from 'axios';

import { context_parse_url } from "./contextFN_parse_url";

export const AppContext = createContext<any>({});

export function AppContextProvider({ children }: { children: ReactNode }){
  //get which env app is running on
  const currentENV = import.meta.env.VITE_MODE;
  //get python server running port;
  const {server_port, fv_id} = context_parse_url() ?? { server_port: "49999", fv_id: "sample_visualization" };
  // state for variable
  const [showVariable, setShowVariable] = useState({})
  //App panel control
  const [panelState, setPanelState] = useState({
    fvWrapper : {
      panelName : "fvWrapper",
      show : true,
      size: {
        maxSize : 100,
        defaultSize: 70
      }
    },
    fv : {
      panelName : "Flowsheet",
      show : true,
      size: {
        minSize : 100,
        defaultSize: 70
      }
    },
    diagnostics:{
      panelName : "Diagnostics",
      show : false,
      size: {
        minSize : 100,
        defaultSize: 70
      }
    },
    streamTable: {
      panelName : "Stream Table",
      show : true,
      size: {
        maxSize : 100,
        defaultSize: 30
      }
    },
    // report : {
    //   panelName : "Report",
    //   show : false
    // },
    // diagnostics : {
    //   panelName : "Diagnostics",
    //   show : true
    // },
});
  //App panel control end

  /**
   * Context for flowsheet
   */
  const [fvHeaderState, setFvHeaderState] = useState({
    isShowSteamName : true,
    isShowLabels : false
  })

  /**
   * Context for variables
   */
  const [variablesExpandState, setVariablesExpandState] = useState({
    expand : false,
    expandState : {}
  });

  //get demo flowsheet state
  const [flowsheetState, setFlowsheetState] = useState({
    cells : null,
    model: null,
    routing_config: null,
  });

  const cells = flowsheetState.cells;
  const model = flowsheetState.model;
  const routing_config = flowsheetState.routing_config;

  async function loadDemoFlowsheet(){
    try {
      const res = await axios.get('/data/demo_flowsheet.json');
      const JSON = res.data
      setFlowsheetState((prev)=>{
        return {
          ...prev, 
          cells : JSON.cells,
          model : JSON.model,
          routing_config : JSON.routing_config
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(()=>{
    loadDemoFlowsheet();
  },[])

  return(
    <AppContext.Provider value={{
      //from url
      server_port,
      fv_id,
      //view btn
      panelState,
      setPanelState,
      //variables open and close
      showVariable,
      setShowVariable,
      //fv
      fvHeaderState,
      setFvHeaderState,
      //variables
      variablesExpandState,
      setVariablesExpandState,
      // expandVariablesHandler,
      //flowsheet data
      cells,
      model,
      routing_config
    }}>
      {children}
    </AppContext.Provider>
  )
}