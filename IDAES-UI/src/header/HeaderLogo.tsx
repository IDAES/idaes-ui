import DiagnosticsToggle from "./DiagnosticsToggle";
import css from './HeaderLogo.module.css';
import IDAESLogo from '../assets/images/idaes-logo.png';

/**
 * @returns Logo component for app header, also contains DiagnosticsToggle init for style purpose.
 */
export default function HeaderLogo() {
    return(
        <div className={css.headerLeftMainContainer}>
            <div id="headerLogoContainer" className={`headerLogoContainer ${css.headerLogoContainer}`}>
                <img src={IDAESLogo} 
                    alt="idaes logo" 
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