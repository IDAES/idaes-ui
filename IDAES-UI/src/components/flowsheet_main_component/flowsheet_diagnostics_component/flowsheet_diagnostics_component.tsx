import { useContext, useEffect, useState} from "react";
import { AppContext } from "@/context/appMainContext";
import axios from "axios";
import { Diagnostic_main } from "./diagnostic_functions/diagnostic_main";
import "./flowsheet_diagnostics.css";
import DiagnosticIssues from "./diagnostics_issues/diagnostics_issues";
import DiagnosticsDisplay from "./diagnostics_display/diagnostics_display";

interface DiagnosticsDataInterface {
    config: {key:any, value:any},
    issues:{issues:any}
    statistics:any
}

export default function FlowsheetDiagnostics(){
    let {server_port} = useContext(AppContext);
    // this use to hold all diagnostic data fetched from api end point pass down to sub components
    const [diagnosticData, setDiagnosticsData] = useState<DiagnosticsDataInterface | null>(null);
    // use to hold which issue currently is displayed on screen setWhichIssue to update diagnostics display
    const [whichIssue, setWhichIssue] = useState<string | null>("structural"); 
    console.log(whichIssue)

    const toggleIssueHandler = (issue:any) =>{
        // this function use in issues component's each issue tab
        // use for when each issue tab click and toggle current displayed issue
        setWhichIssue(issue)
    }

    useEffect(()=>{
        // const getDiagnosticUrl = `http://127.0.0.1:${server_port}/api/get_diagnostics`;
        const windowURL = new URL(window.location.href);
        const id = windowURL.searchParams.get("id");
        const getDiagnosticUrl = `http://localhost:49999/diagnostics?id=${id}`;

        const fetchDiagnosticData = async (url:string) =>{
            // fetch diagnostic data from end point and update to state
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
            <DiagnosticIssues diagnosticData={diagnosticData} toggleIssue={toggleIssueHandler} whichIssue={whichIssue}/>
            <DiagnosticsDisplay diagnosticData={diagnosticData} whichIssue={whichIssue}/>
        </>
    )
}