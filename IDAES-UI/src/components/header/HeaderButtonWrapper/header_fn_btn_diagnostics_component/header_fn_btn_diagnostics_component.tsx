import { useContext } from "react";
import { AppContext } from "@/context/appMainContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import css from './header_fn_btn_diagnostics.module.css'

export default function HeaderFNBtnDiagnostics(){
    const {panelState, setPanelState, setViewInLogPanel} = useContext(AppContext);
    /**
     * @description diagnostics header toggle btn handler, this controls:
     * 1. diagnostics panel show or hide.
     * 2. bottom panel, stream table show or diagnostics logs show when toggle this header diagnostics button.
     */
    function toggleDiagnosticHandler(){
        // control diagnostics panel show or hide
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

        /**
         * control bottom panel show stream or diagnostics logs by update viewInLogPanel state:
         * logic:
         * base on panelState.diagnostics.show
         * diagnostics panel show, default should show diagnostics log
         * diagnostics panel not show. default stream table shows
         * 
         * the bottom panel toggle is in mosaic panel.
         */
        setViewInLogPanel((prev:{streamTable:boolean, diagnosticsLogs:boolean})=>{
            const copyState = {...prev};
            if(panelState.diagnostics.show){
                copyState.streamTable = false;
                copyState.diagnosticsLogs = true;
            }

            if(!panelState.diagnostics.show){
                copyState.streamTable = true;
                copyState.diagnosticsLogs = false;
            }
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