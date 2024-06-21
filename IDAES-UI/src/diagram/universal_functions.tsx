import React from "react";
import { PanelStateInterface } from "@/interface/appMainContext_interface";

type setPanelState = React.Dispatch<React.SetStateAction<PanelStateInterface>>;

/**
   * Minimize flowsheet panel
   * 
   * setState fv.show = false to minimize fv panel
   * @param panelStatekey string, the key of panelState, which panel you want to minimize
   * @param setState callback fn, setPanelState, read from context
   */
export function minimizePanel(panelStatekey:string, setState:setPanelState){
  setState((prevState : PanelStateInterface) =>{
    const newState = {...prevState};
    newState[panelStatekey].show = false;
    return newState;
  })
}

/**
 * Maxmize flowsheet panel
 * 
 * setState if key != param panelStateKey panelState objKey.show = false.
 * @param panelStateKey string, the key of panelState, which panel you want to maxmize
 * @param setState callback fn, setPanelState, read from context
 */
// export function maxmizePanel(panelStateKey:string, setState:setPanelState){
//   setState((prevState:PanelStateInterface)=>{
//     const newState = {...prevState};
//     Object.keys(newState).forEach((objKey:string)=>{
//       if(objKey !== panelStateKey){
//         newState[objKey].show = false;
//       }
//     })
//     return newState;
//   })
// }