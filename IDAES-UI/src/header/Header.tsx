import { useContext } from "react";
import { AppContext } from "../AppContext";

import HeaderLogo from "./HeaderLogo";
import HeaderDiagramName from "./HeaderDiagramName";
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
      {/**This contains header logo and DiagnosticsToggle */}
      <HeaderLogo /> 
      <HeaderDiagramName />
      <HeaderButtons />
    </header>
  )
}