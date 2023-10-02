import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "@/context/appMainContext";

export default function HeaderFNBtnDiagnostics(){
    const {panelState, setPanelState} = useContext(AppContext);
    function toggleDiagnosticHandler(){
        setPanelState((prev:any)=>{
            const copyState = {...prev};
            copyState.diagnostics.show = !copyState.diagnostics.show;
            return copyState;
        })
    }
    return(
        <li 
            id="headerDiagnosticsBtn" 
            className={`header_each_btn`}
            onClick={toggleDiagnosticHandler}
        >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-sm"/>
            Diagnostics
        </li>
    )
}