import { useContext } from "react";
import { AppContext } from "../../../context/appMainContext";

import css from "./header_flowsheet_name.module.css";

export default function HeaderFlowsheetName(){
  const {fv_id} = useContext(AppContext)
  // const model = context.model
  // let hasContext:boolean = false
  // let flowsheetName:string = "Loading..."

  // //this check if context pass with data through async funtion
  // function getContext(model:any){
  //   if(model){
  //     hasContext = true;
  //   }
  // }

  // //update flowsheet name to header
  // //if has no context just return
  // //if has flowsheet name
  // //check if has model id (the flowsheet name)
  // //has : update flowsheet name
  // //does'n has: update hint to user
  
  // function loadFlowsheetName(hasContext:boolean){
  //   if(!hasContext){
  //     return;
  //   }
  //   flowsheetName = model.id ? 
  //   flowsheetName = model.id : 
  //   flowsheetName = `Looks like your flowsheet has no name yet, please check your JSON file under /model /id`; 
  // }


  // getContext(model);
  // loadFlowsheetName(hasContext);

  return(
    <p className={`${css.header_flowsheet_name}`}>{fv_id ? fv_id : "loading..."}</p>
  )
}