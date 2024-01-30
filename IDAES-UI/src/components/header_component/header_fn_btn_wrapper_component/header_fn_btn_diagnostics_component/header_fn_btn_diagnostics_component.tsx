import { useContext } from "react";
import { AppContext } from "@/context/appMainContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import css from './header_fn_btn_diagnostics.module.css'

export default function HeaderFNBtnDiagnostics(){
    const {panelState, setPanelState} = useContext(AppContext);
    function toggleDiagnosticHandler(){
        setPanelState((prev:any)=>{
            const copyState = {...prev};
            const currentDiagnosticsPanelShow = !copyState.diagnostics.show;
            copyState.diagnostics.show = currentDiagnosticsPanelShow

            //update loacl storage 
            const localStorageItem = localStorage.getItem("idaesUIGeneral");
            const idaesUIGeneralLocalStorage : any = localStorageItem ? JSON.parse(localStorageItem): "";
            idaesUIGeneralLocalStorage.showDiagnosticsPanel = currentDiagnosticsPanelShow;
            localStorage.setItem("idaesUIGeneral",JSON.stringify(idaesUIGeneralLocalStorage))

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
            <p>Diagnostics {}</p>
        </div>
    )
}