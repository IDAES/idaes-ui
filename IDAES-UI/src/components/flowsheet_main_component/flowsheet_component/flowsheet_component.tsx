import { MainFV } from "./flowsheet_functions/mainFV";

import { useContext, useRef, useEffect } from "react";
import { AppContext } from "../../../context/appMainContext";

import css from "./flowsheet.module.css";

declare var joint: any;
declare var paper: any;

export default function Flowsheet(){
  const {panelState, cells} = useContext(AppContext);
  const isShowFlowsheet = panelState["fv"].show;

  useEffect(()=>{
    console.log(window.location.href + "fv?id=sample_visualization")
    // new MainFV("sample_visualization", "53781")
  },[]);

  return(
    <>
      <h1>{import.meta.env.VITE_TEST}</h1>
      {
        isShowFlowsheet &&
        <section id="fvContainer" className={`${css.fvContainer}`}>
          <div id="fv" className={`${css.fv}`}></div>
        </section>
      }
    </>
  )
}