import { useEffect} from "react";
import axios from "axios";
import DiagnosticsHeader from "./flowsheet_diagnostics_header/flowsheet_diagnostics_header";
import { Diagnostic_main } from "./diagnostic_functions/diagnostic_main";
import "./flowsheet_diagnostics.css";


export default function FlowsheetDiagnostics(){
    useEffect(()=>{
        let diagnosticDataURL = "/public/data/diagnostic_example.json";
        let diagnosticMain = new Diagnostic_main(diagnosticDataURL);
    },[])
    return (
        <>
            <DiagnosticsHeader />
            <div id="diagnosticsContainer"></div>
        </>
    )
}