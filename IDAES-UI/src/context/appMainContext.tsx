import { createContext, useState, ReactNode } from "react";

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

  return(
    <AppContext.Provider value={{
      //view btn
      panelState,
      setPanelState,
    }}>
      {children}
    </AppContext.Provider>
  )
}