import HeaderButtons from "./HeaderButtons";
import DiagnosticsToggle from "./DiagnosticsToggle";
import styles from "./Header.module.css";
import idaes_logo from "@/assets/images/idaes-logo.png";

/**
 * @description Application header
 * @returns Header component
 */
export default function Header() {
    const flowsheetName = fv_id ? fv_id : "Name not found";
    return (
        <header id="header" className='.header_container'>
            <div className={styles.headerLeftMainContainer}>
                {/* -- IDAES logo -- */}
                <div id="headerLogoContainer"
                     className={styles.headerLogoContainer}>
                    <img src={idaes_logo}
                         alt="IDAES logo"
                         id="headerLogo"
                         className={styles.headerLogo}
                    />
                    <p id="headerLogoText" className={styles.headerLogoText}>IDAES</p>
                </div>
                <DiagnosticsToggle/>
            </div>
            {/* -- Flowsheet name -- */}
            <p id="flowsheet_name_title"
               className={styles.headerFlowsheetName}>{flowsheetName}
            </p>
            {/* -- Header buttons */}
            <HeaderButtons/>
        </header>
    )
}