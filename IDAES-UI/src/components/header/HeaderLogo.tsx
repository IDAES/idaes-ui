import DiagnosticsToggle from "./DiagnosticsToggle";
import css from './HeaderLogo.module.css';
import idaes_logo from '@/idaes-logo.png';

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
        <DiagnosticsToggle />
      </div>
    </div>
  )
}