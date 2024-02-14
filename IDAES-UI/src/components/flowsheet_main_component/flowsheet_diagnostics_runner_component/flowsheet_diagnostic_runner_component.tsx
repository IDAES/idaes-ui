import React from "react";
import { useContext } from "react";
import { AppContext } from "@/context/appMainContext";
import css from "./flowsheet_diagnostics_runner.module.css";
export default function FlowsheetDiagnosticsRunner(){
    const {diagnosticsNextStepsOutputState, diagnosticsRunnerDisplayState} = useContext(AppContext);
    
    // initial run function display
    let display:any = "";

    if(!diagnosticsRunnerDisplayState ||  diagnosticsRunnerDisplayState == "default"){
        display = "Please select a function to check diagnostics result!"
    }else if(!diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState] || diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState][0].diagnostics_runner_result.length == 0){
        console.log(`in`)
        display = "Please run diagnostics function first!"
    }else if(diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState] && diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState]){
        console.log()
        display = diagnosticsNextStepsOutputState[diagnosticsRunnerDisplayState].map((el:any, index:number)=>{
            return(
                <React.Fragment key={`diagnosticsRunnerDisplayContentContainerContent${index}`}>
                    <pre className={css.diagnostics_runner_output_pre}>{el.diagnostics_runner_result}</pre>
                </React.Fragment>
            )
        })
    }

    console.log()

    return(
        <div className={css.diagnosticsRunner_content_container} style={{"overflowY" : "scroll"}}>
            {display}
        </div>
    )
}