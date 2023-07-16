import HeaderFNBtnRefresh from "./header_fn_btn_refresh_component/header_fn_btn_refresh";
import HeaderFNBTNSave from "./header_fn_btn_save_component/header_fn_btn_save";
import HeaderFNBtnView from "./header_fn_btn_view_component/header_fn_btn_view";

import css from "./header_fn_btn.module.css"
export default function HeaderFunctionButtonsWrapper(){
  return(
    <ul className={`${css.header_fn_btn_wrapper_ul}`}>
      <HeaderFNBtnRefresh />
      <HeaderFNBTNSave />
      <HeaderFNBtnView />
    </ul>
  )
}