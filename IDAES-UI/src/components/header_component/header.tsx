import { useContext } from "react";
import { AppContext } from "../../context/appMainContext";

import HeaderLogo from "./header_logo_component/header_logo";
import HeaderFlowsheetName from "./header_flowsheet_name_component/header_flowsheet_name";
import HeaderFunctionButtonsWrapper from "./header_fn_btn_wrapper_component/hader_fn_btn_wrapper";

import "./header.css";
import css from "./header.module.css";

export default function Header(){
  let val = useContext(AppContext)
  
  return (
    <header id="header" className={`row ${css.header_container}`}>
      <HeaderLogo />
      <HeaderFlowsheetName />
      <HeaderFunctionButtonsWrapper />
    </header>
  )
}