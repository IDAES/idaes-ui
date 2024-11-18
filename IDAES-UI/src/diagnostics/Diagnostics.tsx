import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/AppContext";
import axios from "axios";
import { messageBarTemplateGenerator } from "@/components/MessageBar/MessageBarTemplateGenerator";
// import { InitialDiagnostics } from "./InitialDiagnostics"; //????? here is imported but never use?
import DiagnosticHeader from "./DiagnosticsHeader";
import DiagnosticsDisplay from "./DiagnosticsDisplay";

import "./Diagnostics.css";

interface DiagnosticsDataInterface {
    config: { key: any, value: any },
    issues: { issues: any }
    statistics: any
}

export default function Diagnostics() {
    let { server_port, diagnosticsRefreshState } = useContext(AppContext);
    // this use to hold all diagnostic data fetched from api end point pass down to sub components
    const [diagnosticData, setDiagnosticsData] = useState<DiagnosticsDataInterface | null>(null);
    // use to hold which issue currently is displayed on screen setWhichIssue to update diagnostics display
    const [whichIssue, setWhichIssue] = useState<string | null>("structural");

    const toggleIssueHandler = (issue: any) => {
        // this function use in issues component's each issue tab
        // use for when each issue tab click and toggle current displayed issue
        setWhichIssue(issue)
    }

    useEffect(() => {
        // const getDiagnosticUrl = `http://127.0.0.1:${server_port}/api/get_diagnostics`;
        const windowURL = new URL(window.location.href);
        const id = windowURL.searchParams.get("id");
        const getDiagnosticUrl = `http://localhost:${server_port}/diagnostics?id=${id}`;

        const fetchDiagnosticData = async (url: string) => {
            // fetch diagnostic data from end point and update to state
            try {
                const res = await axios.get(url);
                const data = res.data
                messageBarTemplateGenerator("diagnosticRefresh", true);
                setDiagnosticsData(data);
            } catch (error) {
                console.error("Fetch diagnostic data error", error)
                messageBarTemplateGenerator("diagnosticRefresh", false);
            }
        }
        fetchDiagnosticData(getDiagnosticUrl);
    },
        /**
         * useEffect triggers:
         * 1. onload
         * 2. on diagnosticsRefreshState changed (click handler in mosaic to toggle this bool state)
         */
        [diagnosticsRefreshState]);

    return (
        <>
            <DiagnosticHeader
                diagnosticData={diagnosticData}
                toggleIssue={toggleIssueHandler}
                whichIssue={whichIssue}
            />
            <DiagnosticsDisplay
                diagnosticData={diagnosticData}
                whichIssue={whichIssue}
            />
        </>
    )
}