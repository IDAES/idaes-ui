import { useContext, useEffect, useState} from "react";
import { AppContext } from "@/context/appMainContext";
import axios from "axios";
import DiagnosticsHeader from "./flowsheet_diagnostics_header/flowsheet_diagnostics_header";
import { Diagnostic_main } from "./diagnostic_functions/diagnostic_main";
import DiagnosticIssues from "./diagnostics_issues/diagnostics_issues";
import "./flowsheet_diagnostics.css";


export default function FlowsheetDiagnostics(){
    const [diagnosticData, setDiagnosticsData] = useState(null);
    let {server_port} = useContext(AppContext);
    
    useEffect(()=>{
        const getDiagnosticUrl = `http://127.0.0.1:${server_port}/api/get_diagnostics`
        // const fetchDiagnosticsData = axios.get(url);
        // console.log(fetchDiagnosticsData);

        const fetchDiagnosticData = async (url:string) =>{
            try{
                const res = await axios.get(url);
                const data = res.data
                setDiagnosticsData(data);
            }catch(error){
                console.error("Fetch diagnostic data error", error)
            }
        }
        fetchDiagnosticData(getDiagnosticUrl);
    },[]);

    return (
        <>
            <DiagnosticsHeader />
            <DiagnosticIssues diagnosticData={diagnosticData}/>
            {/* <div id="diagnosticsContainer"></div> */}
        </>
    )
}