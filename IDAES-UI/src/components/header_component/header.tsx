import HeaderLogo from "./header_logo_component/header_logo";
import HeaderFlowsheetName from "./header_flowsheet_name_component/header_flowsheet_name";
import HeaderFunctionButtonsWrapper from "./header_function_buttons_wrapper_component/hader_function_buttons_wrapper";

export default function Header(){
  return (
    <header className={`holder`}>
      <HeaderLogo />
      <HeaderFlowsheetName />
      <HeaderFunctionButtonsWrapper />
    </header>
  )
}