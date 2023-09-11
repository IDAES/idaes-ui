import { useContext } from "react";
import {  AppContext } from "../../../../context/appMainContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableColumns, faCheck } from "@fortawesome/free-solid-svg-icons";

import css from "./header_fn_btn_view.module.css"


export default function HeaderFNBtnView(){
  let {panelState, setPanelState} = useContext(AppContext);

  //map view list base on state
  const notRenderPanelList : Array<string> = ["fvWrapper"];

  let viewList = Object.keys(panelState).map((el:string, index:number) =>{
    if(!notRenderPanelList.includes(panelState[el].panelName)){
      return(
        <li key={panelState[el].panelName + index} 
            className={`mb-sm ${css.header_fn_btn_each_view}`} 
            onClick={() => panelShowHandler(panelState[el].panelName)}
        >
          <span>{panelState[el].panelName}</span>
          {panelState[el].show ? <FontAwesomeIcon icon={faCheck} /> : null}
        </li>
      )
    }
  });

  //handle panel show hide
  function panelShowHandler(selectedPanelName:string){
    setPanelState((prev:any) => {
      let newState = {...prev};
      for (let key in newState) {
        if (newState[key].panelName === selectedPanelName) {
          newState[key] = {...newState[key], show: !newState[key].show};
        }
      }
      return newState;
    })
  }

  return(
    <>
      <li className={`${css.header_fn_btn_wrapper_li} header_each_btn` }>
        <FontAwesomeIcon icon={faTableColumns} className="mr-sm" />
        View
        <ul className={`crd_shadow-light ${css.header_fn_btn_hover_ul}`}>
          {viewList}
        </ul>
      </li>
    </>
  )
}