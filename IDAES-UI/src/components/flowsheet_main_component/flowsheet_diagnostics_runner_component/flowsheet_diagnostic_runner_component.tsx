import { useContext } from "react";
import { AppContext } from "@/context/appMainContext";
import css from "./flowsheet_diagnostics_runner.module.css";
export default function FlowsheetDiagnosticsRunner(){
    const {diagnosticsRunFnState, setDiagnosticsRunFnState} = useContext(AppContext);
    
    // initial run function display
    let display = "loading..."
    return(
        <div className={css.diagnosticsRunner_content_container}>
            {display}
        </div>
    )
}