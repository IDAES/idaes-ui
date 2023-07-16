import { useContext } from "react";
import { AppContext } from "../../../context/appMainContext";

export default function Flowsheet_variable(){
  let context = useContext(AppContext)
  let isShowVariable = context.panelState[1].show

  return(
    <>
    {
      isShowVariable && 
      <section>
        <ul>
          <li>variables </li>
          <li>variables </li>
          <li>variables </li>
          <li>variables </li>
          <li>variables </li>
        </ul>
      </section>
    }
    </>
  )
}