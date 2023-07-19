import { useContext,useEffect } from "react";
import { AppContext } from "../../../context/appMainContext";

import css from "./flowsheet_variable.module.css";

export default function Flowsheet_variable(){
  const context = useContext(AppContext);

  let isShowVariable = context.panelState[1].show

  //flowsheet context
  const cells = context.cells;
  const model = context.model;
  const routing_config = context.routing_config;

  let label = "loading...";
  
  if(cells){
    label = cells.map((el:any, index:number)=>{
      if(el.attrs && el.attrs.label && el.attrs.label.text){
        return <li key={el.attrs.label.text + index}>{el.attrs.label.text}</li>
      }
    })
  }

  if(model){
    Object.keys(model.arcs).map((el:any, index:number)=>{
      
    })
  }

  useEffect(()=>{
    
  }, [cells])

  return(
    <>
    {
      isShowVariable && 
      <section className={`pd-md`}>
        <ul className={`${css.flowsheet_variable_ul}`}>
          {label}
        </ul>
      </section>
    }
    </>
  )
}

