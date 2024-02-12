import { useContext } from "react";
import { AppContext } from "@/context/appMainContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import css from './header_fn_btn_diagnostics.module.css'

export default function HeaderFNBtnDiagnostics(){
    const {panelState, setPanelState} = useContext(AppContext);
    /**
     * @description diagnosts header toggle btn handler
     * 1. read current panelState.diagnostics.show and set it to opposite
     * 2. update local storage's diangosticsPanelShow as the bool value above
     * 3. setState update UI
     */
    function toggleDiagnosticHandler(){
        setPanelState((prev:any)=>{
            // update diagnostics panel show bool
            const copyState = {...prev};
            const currentDiagnosticsPanelShow = !copyState.diagnostics.show;
            copyState.diagnostics.show = currentDiagnosticsPanelShow

            // update loacl storage 
            const appSettingLocalStorage = localStorage.getItem("appSetting")!;
            const appSettingObj = JSON.parse(appSettingLocalStorage);
            appSettingObj.diagnosticsPanelShow = currentDiagnosticsPanelShow;
            localStorage.setItem("appSetting",JSON.stringify(appSettingObj))

            //update state
            return copyState;
        })
    }
    return(
        <div 
            id="headerDiagnosticsBtn" 
            className={`header_each_btn ${css.headerDiagnosticsBtnContainer}`}
            onClick={toggleDiagnosticHandler}
        >
            <span className={css.taggleBtn}>
                <span className={panelState.diagnostics.show ? css.toggleBtnInnerOn : css.toggleBtnInnerOff}>
                { 
                    panelState.diagnostics.show ? 
                    <FontAwesomeIcon icon={faCheck} className={css.faIcon}/> :
                    <FontAwesomeIcon icon={faX} className={css.faIcon}/> 
                }
                </span>
            </span>
            <p>Diagnostics</p>
        </div>
    )
}