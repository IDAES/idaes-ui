import HeaderFNBtnDiagnostics from '../header_fn_btn_wrapper_component/header_fn_btn_diagnostics_component/header_fn_btn_diagnostics_component';
import css from './header_logo.module.css';
import idaes_logo from '../../../assets/images/idaes-logo.png';

export default function HeaderLogo() {
  return(
    <div className={css.headerLeftMainContainer}>
      <div id="headerLogoContainer" className={`headerLogoContainer ${css.headerLogoContainer}`}>
        <img src={idaes_logo} 
            alt="idaes logo for header component" 
            id="headerLogo" 
            className={`${css.headerLogo}`}
        />
        <p id="headerLogoText" className={`${css.headerLogoText}`}>IDAES</p>
      </div>
      <div>
        <HeaderFNBtnDiagnostics />
      </div>
    </div>
  )
}