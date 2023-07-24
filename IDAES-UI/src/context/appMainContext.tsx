import { createContext, useState, ReactNode, useEffect } from "react";
import axios from 'axios';

export const AppContext = createContext<any>({});

export function AppContextProvider({ children }: { children: ReactNode }){
  //App panel control
  const [panelState, setPanelState] = useState([
    {
      panelName : "Flowsheet",
      show : true
    },
    {
      panelName : "Variables",
      show : true
    },
    {
      panelName : "Stream Table",
      show : true
    },
    {
      panelName : "Report",
      show : false
    },
    {
      panelName : "Diagnostics",
      show : true
    },
  ]);
  //App panel control end

  /**
   * Context for flowsheet
   */
  const [fvHeaderState, setFvHeaderState] = useState({
    isShowSteamName : false,
    isShowLabels : false
  })
  
  /**
   * Context for variables
   */
  const [variablesExpandState, setVariablesExpandState] = useState({
    expand : false,
    expandState : {}
  });

  function expandVariablesHandler(){
    //when Click to toggle variable expand or collapse
    //click btn is in variable header
    setVariablesExpandState(prev=>{
      let copyPrev = {...prev, expand : !prev.expand};
      return copyPrev;
    })
  }

  /**
   * Context for variables end
   */

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
      //view btn
      panelState,
      setPanelState,
      //fv
      fvHeaderState,
      setFvHeaderState,
      showSteamNameHandler,
      showLabelsHandler,
      //variables
      variablesExpandState,
      expandVariablesHandler,
      //flowsheet data
      cells,
      model,
      routing_config
    }}>
      {children}
    </AppContext.Provider>
  )
}