import { useContext } from "react";
import { AppContext } from "@/AppContext";

import css from "./HeaderDiagramName.module.css";

// return component <HeaderDiagramName /> name use in header
export default function HeaderDiagramName(){
  const {fv_id} = useContext(AppContext)
  return(
    <p id="flowsheet_name_title" className={`${css.header_diagram_name_text}`}>{fv_id ? fv_id : "Name not found"}</p>
  )
}