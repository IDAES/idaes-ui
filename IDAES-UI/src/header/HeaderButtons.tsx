import styles from "./HeaderButtons.module.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowsRotate,
    faCircleQuestion,
    faExchange,
    faFloppyDisk
} from "@fortawesome/free-solid-svg-icons";

/**
 * @description Buttons for the application, displayed in the header.
 * @constructor
 */
export default function HeaderButtons() {

    function resetPanelLayoutHandler() {
        const layoutRelatedItems: Array<string> = ["mosaicLayout", "layout", "diagnosticsPanelParams"];
        layoutRelatedItems.forEach(el => {
            localStorage.removeItem(el);
        })
        window.location.reload();
    }

    const faIconClass = "mr-sm"; // style for font-awesome icons

    return (
        <ul className={styles.header_fn_btn_wrapper_ul}>
            {/* Refresh */}
            <li id="refresh_btn" className={styles.headerButton}>
                <FontAwesomeIcon icon={faArrowsRotate} className={faIconClass}/>
                Refresh
            </li>
            {/* Save */}
            <li id="save_btn" className={styles.headerButton}>
                <FontAwesomeIcon icon={faFloppyDisk} className={faIconClass}/>
                Save
            </li>
            {/* Reset */}
            <li id="save_btn" className={styles.headerButton} onClick={() => {
                resetPanelLayoutHandler()
            }}>
                <FontAwesomeIcon icon={faExchange} className={faIconClass}/>
                Reset Layout
            </li>
            {/* Help */}
            <li id="help_btn" className={styles.headerButton}>
                <FontAwesomeIcon icon={faCircleQuestion} className={faIconClass}/>
                <a href="https://idaes-pse.readthedocs.io/en/latest/tutorials/getting_started/index.html"
                   target="_blank" className={styles.link}>Help</a>
            </li>
        </ul>
    )
}
