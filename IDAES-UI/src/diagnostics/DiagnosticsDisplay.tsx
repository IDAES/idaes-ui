import { useContext, useEffect } from "react";
import { AppContext } from "@/AppContext";
import axios from "axios";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { messageBarTemplateGenerator } from "@/components/MessageBar/MessageBarTemplateGenerator";
import css from "./DiagnosticsDisplay.module.css";

export default function DiagnosticsDisplay(props:any){
    // initial context
    const {server_port,fv_id,diagnosticsNextStepsOutputState, setDiagnosticsNextStepsOutputState, diagnosticsRunFnNameListState, setDiagnosticsRunFnNameListState, setDiagnosticsRunnerDisplayState} = useContext(AppContext);
    // initial diagnostics data
    const diagnosticData = props.diagnosticData;
    // initial which issue from props
    const whichIssue = props.whichIssue;
    // initial main display
    let jacobianConditionDisplay: any = "Loading jacobian condition..."
    let modelStatisticsStructuralDisplay: any = "Loading model statistics structural..."
    let warningDisplay:any = "Loading warning...";
    let cautionDisplay:any = "Loading caution...";
    let configDisplay: any = "Loading config ...";
    let diagnosticSeverityDisplay:any = "Loading diagnostic result...";
    let nextStepDisplay:any = "Loading suggested next step...";

    let numberOfWarnings:number = 0;
    let numberOfCautions:number = 0;

    let currentIssueNextStepsNameList:Array<String> = [];

    if(whichIssue && diagnosticData && diagnosticData.diagnostics_toolbox_report){
        // start populate diagnostics each display
        const tbxReport = diagnosticData.diagnostics_toolbox_report;

        
        // build jacobian condition
        jacobianConditionDisplay = <pre className={css.diagnostics_display_pre_tag}>{tbxReport.toolbox_jacobian_condation}</pre>

        // populate model statistics
        const modelStatisticsData = tbxReport.toolbox_model_statistics;
        if(modelStatisticsData && modelStatisticsData.length > 0){
            modelStatisticsStructuralDisplay = modelStatisticsData.map((eachStatisticsContent:string, index:number)=>{
                return(
                    <pre key={`model_structural_statistics_content${index}_${eachStatisticsContent}`} 
                    className={css.diagnostics_display_pre_tag}
                    >
                        {eachStatisticsContent}
                    </pre>
                )
            })
        }else{
            modelStatisticsStructuralDisplay =
            <>
                <pre className={css.diagnostics_display_pre_tag}>   Model Statistics is not generate by diagnostics toolbox, please run: </pre>
                <pre className={css.diagnostics_display_pre_tag}>   dt = DiagnosticsToolbox(model)</pre>
                <pre className={css.diagnostics_display_pre_tag}>   dt.report_structural_issues()</pre>
                <pre className={css.diagnostics_display_pre_tag}>   dt.report_numerical_issues()</pre>
            </>;
        }

        // build warning display
        const warningData = tbxReport[whichIssue == "structural" ? "structural_report" : "numerical_report"].warning[0];
        numberOfWarnings = warningData.length;
        if(warningData && warningData.length > 0){
            warningDisplay = warningData.map((eachWarning:string, index:number)=>{
                                eachWarning = eachWarning.replace("WARNING", "Warning")
                                return (
                                    <pre key={`eachWarning_${index}_${eachWarning}`}
                                        className={css.diagnostics_display_pre_tag}
                                    >
                                        {eachWarning}
                                    </pre>
                                )
                            })
        }else{
            warningDisplay = <pre className={css.diagnostics_display_pre_tag}>No warning.</pre>
        }

        // build caution display
        const cautionData = tbxReport[whichIssue == "structural" ? "structural_report" : "numerical_report"].caution;
        numberOfCautions = cautionData.length;
        if(cautionData && cautionData.length > 0){
            cautionDisplay = cautionData.map((eachCaution:string, index:number)=>{
                                eachCaution = eachCaution.replace("CAUTION", "Caution")
                                return (
                                    <pre key={`eachCaution_${index}_${eachCaution}`}
                                    className={css.diagnostics_display_pre_tag}
                                    >
                                        {eachCaution}
                                    </pre>
                                )
                            })
        }else{
            cautionDisplay = <pre className={css.diagnostics_display_pre_tag}>No caution.</pre>;
        }

        // build next steps display
        let hasNextStep: boolean = false;
        const nextStepsData = tbxReport["next_steps"][whichIssue == "structural" ? "structural" : "numerical"];
        if(nextStepsData.length > 0){
            hasNextStep = true;
            currentIssueNextStepsNameList = [...nextStepsData];
        }

        // when no next step, display default line from diagnostics toolbox
        // when has next step, populate next steps and display them
        if(!hasNextStep){
            // structural default
            if(whichIssue == "structural") nextStepDisplay = "Try to initialize / solve your model and then call report_numerical_issues()";
            // numerical default
            if(whichIssue == "numerical") nextStepDisplay = "Try to initialize / solve your model and then call report_numerical_issues()";
        }else{
            // base on nextStepData build nextStepDisplay
            nextStepDisplay = nextStepsData.map((eachNextStep: string, index:number)=>{
                return(
                    <p key={`diagnostics_suggested_next_step_${eachNextStep}`}
                        className={`${css.diagnostics_display_each_next_step_content}`}
                        // onClick={clickCopyToClipboard}
                    >
                        <span className="function_name">{eachNextStep}</span>
                        <span className={`${css.next_step_function_btn}`} onClick={()=>{runDiagnostics(eachNextStep)}}>Run</span>
                        <span className={`${css.next_step_function_btn}`} onClick={clickCopyToClipboard}>
                            Copy
                        </span>
                    </p>
                )
            })
        }
        
        // basic on currentIssueNextStepsNameList which is nextSteps function name array to update setDiagnosticsRunFnNameListState
        // this is in useEffect, to prevent warning error update other component will render this component
    }

    /**
     * @description click run diagnostics by pass suggested next function name to api and return running result
     * @param whichFunction when click on suggested next steps function name will auto pass in this functions
     */
    async function runDiagnostics(whichFunction:string){
        try{
            // validate if whichFunction param is there
            if(!whichFunction) return;
            setDiagnosticsRunnerDisplayState(whichFunction)
            // initial function name by remove () in function
            let functionName:string = whichFunction.replace("(", "").replace(")", "");
            // build api call url
            const post_diagnostics_runner_url:string = `http://localhost:${server_port}/run_diagnostic`;
            // build api call body
            const windowURL = new URL(window.location.href);
            const urlId = windowURL.searchParams.get("id");
            const body = {function_name: functionName, id: urlId};
            // api call return diagnostics runner result or error
            const result = await axios.put(post_diagnostics_runner_url, body);
            console.log(result)
            const diagnosticsFunctionRunnerResult = result.data;
            // update diagnosticsNextStepsOutPut
            setDiagnosticsNextStepsOutputState((prev:any)=>{
                // copy state
                const copyState = {...prev}
                // when there has no whichFunction as key in state make one value as empty array
                if(!copyState[whichFunction]){
                    copyState[whichFunction] = [];
                }
                // when there is whichFunction as key in state, just push the diagnosticsFunctionRunnerResult to it
                if(copyState[whichFunction]){
                    copyState[whichFunction].push(diagnosticsFunctionRunnerResult)
                }
                // update state by return copyState
                return copyState
            })

        }catch(error:any){
            messageBarTemplateGenerator("diagnosticFNRunError", false, error.response.data.error)
            console.log(error)
            const diagnosticsLogContainer = document.getElementById("diagnostics_log_container");
            if(diagnosticsLogContainer){
                const errorTemplate = `
                    <pre class="${css.error_message}">${error.response.data.error}<pre>
                    <br>
                `
                diagnosticsLogContainer.innerHTML+= errorTemplate
            }
        }
    }

    useEffect(()=>{
        // basic on currentIssueNextStepsNameList which is nextSteps function name array to update setDiagnosticsRunFnNameListState
        for(let i = 0; i < currentIssueNextStepsNameList.length; i++){
            if(!diagnosticsRunFnNameListState.includes(currentIssueNextStepsNameList[i])){
                const newDiagnosticsNextStepsFunctionName = currentIssueNextStepsNameList[i];
                setDiagnosticsRunFnNameListState((prev: Array<String>)=>{
                    const copyState = prev.map(el=>el);
                    copyState.push(newDiagnosticsNextStepsFunctionName)
                    return copyState
                })
            }
        }
    },[currentIssueNextStepsNameList])

    return(
        <div className={`${css.diagnostics_display_main_container}`}>
            {/*Model Statistics*/}
            <div className={css.diagnostic_display_each_section_container}>
                <p className={css.diagnostic_display_section_title}>Model Statistics</p>
                { 
                    whichIssue == "structural" || !whichIssue ? 
                        modelStatisticsStructuralDisplay : 
                        jacobianConditionDisplay
                }
            </div>
            {/*Warning and Cautions*/}
            <div className={css.diagnostic_display_each_section_container}>
                <div className={css.diagnostics_warning_caution_main_container}>
                    <div className={`${css.diagnostic_display_each_severity_title} ${css.warning}`}>
                        WARNINGS
                        <span>{numberOfWarnings}</span>
                    </div>
                    <div className={css.diagnostics_warning_caution_display_container}>
                        {warningDisplay}
                    </div>
                </div>
                <div className={css.diagnostics_warning_caution_main_container}>
                    <div className={`${css.diagnostic_display_each_severity_title} ${css.caution}`}>
                        CAUTIONS
                        <span>{numberOfCautions}</span>
                    </div>
                    <div className={css.diagnostics_warning_caution_display_container}>
                        {cautionDisplay}
                    </div>
                </div>
            </div>
            {/*next steps*/}
            <div className={css.diagnostic_display_each_section_container}>
                { 
                    nextStepDisplay != "Loading suggested next step..." && 
                    <p className={css.diagnostic_display_section_title}>Suggested next steps:</p>
                }
                <div className={css.diagnostic_display_diagnostic_content_container}>
                    {nextStepDisplay}
                </div>
            </div>
        </div>
    )
}

function clickCopyToClipboard(event:React.MouseEvent<HTMLParagraphElement, MouseEvent>){
    /**
     * This function use for copy clicked next steps to clipboard and user can use it
     * Args:
     *  event: React mouse event
     */
    // let contentWillCopy:null | HTMLElement = null;
    let target = event.currentTarget as HTMLElement;
    let contentWillCopy = target.parentElement!.querySelector('.function_name');

    // make sure contentWillCopy is there or return
    if(!contentWillCopy){
        console.error("There is an issue with click copy next step function")
        return;
    }

    const textToCopy = contentWillCopy.textContent || "";
    // copy to clip board
    navigator.clipboard.writeText(textToCopy).then(() => {
        let updateCopyTextTimeout;
        if(updateCopyTextTimeout){
            clearTimeout(updateCopyTextTimeout);
        }else{
            // when click on copy, update the target innerText to copied
            // then roll back to copy after .9 sec
            target.innerText = "Copied"
            updateCopyTextTimeout = setTimeout(()=>{target.innerText = "Copy"},900);
        }
        
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}