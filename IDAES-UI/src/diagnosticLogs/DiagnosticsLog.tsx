import React from "react";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "@/AppContext";
import css from "./DiagnosticsLog.module.css";
export default function DiagnosticsLog(){
    const {
            diagnosticsNextStepsOutputState, 
            diagnosticsRunnerDisplayState,
            diagnosticsHistoryState,
            setDiagnosticsHistory
        } = useContext(AppContext);
    
    // initial run function display
    let display:any = "";
    let displayLength:number = 0

    if(!diagnosticsRunnerDisplayState ||  diagnosticsRunnerDisplayState == "default"){
        display = "Please select a function to check diagnostics result!"
    }else if(!diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState] || diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState][0].diagnostics_runner_result.length == 0){
        display = "Please run diagnostics function first!"
    }else if(diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState] && diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState]){
        // get current diagnostics's length
        displayLength = diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState].length;
        
        display = diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState].map((el:any, index:number)=>{
            return(
                <React.Fragment key={`diagnosticsRunnerDisplayContentContainerContent${index}`}>
                    <pre id={`diagnostics_log_${index}`}className={css.diagnostics_runner_output_pre}>{el.diagnostics_runner_result}</pre>
                </React.Fragment>
            )
        })
    }

    useEffect(()=>{
        setDiagnosticsHistory((prev:number)=>displayLength)
    },[displayLength]);

    useEffect(()=>{
        // Setup diagnostics log panel height is 100% as parent element height
        const diagnosticsLogPanelLogContainer = document.getElementById('diagnostics_log_container');
        if(diagnosticsLogPanelLogContainer){
            const parentElement = diagnosticsLogPanelLogContainer.parentElement;
            if(parentElement){
                parentElement.style.position = "relative";
                parentElement.style.height = "100%";
                diagnosticsLogPanelLogContainer.style.height = "100%";
                diagnosticsLogPanelLogContainer.style.minHeight = "100%";
                diagnosticsLogPanelLogContainer.style.maxHeight = "100%";
            }
        }
    },[])

    return(
        <div 
            className={css.diagnostics_log_container} 
            id="diagnostics_log_container" 
            style={{"overflowY" : "scroll"}}
        >
            {display}
        </div>
    )
}