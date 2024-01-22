import HeaderFNBtnRefresh from "./header_fn_btn_refresh_component/header_fn_btn_refresh";
import HeaderFNBtnSave from "./header_fn_btn_save_component/header_fn_btn_save";
import HeaderFNBtnHelp from "./header_fn_btn_help_component/header_fn_btn_help_component";

import css from "./header_fn_btn.module.css"
export default function HeaderFunctionButtonsWrapper(){
  return(
    <ul className={`${css.header_fn_btn_wrapper_ul}`}>
      <HeaderFNBtnRefresh />
      <HeaderFNBtnSave />
      <HeaderFNBtnHelp />
    </ul>
  )
}