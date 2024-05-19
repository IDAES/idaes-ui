import { useContext } from "react";
import { AppContext } from "../AppContext";

import HeaderLogo from "./HeaderLogo";
// import HeaderFlowsheetName from "./header_flowsheet_name_component/header_flowsheet_name";
import HeaderButtons from "./HeaderButtons";

import css from "./Header.module.css";

/**
 * @description react component use to wrap all header related components
 * @returns react component <Header />
 */
export default function Header(){
  let val = useContext(AppContext);
  
  return (
    <header id="header" className={`row ${css.header_container}`}>
      <HeaderLogo /> {/**This contains header logo and DiagnosticsToggle */}
      {/* <HeaderFlowsheetName /> */}
      <HeaderButtons />
    </header>
  )
}