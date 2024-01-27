import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import css from "./diagnostics_display.module.css";
import p from "@blueprintjs/icons/lib/esm/generated/16px/paths/blank";

export default function DiagnosticsDisplay(props:any){
    // initial diagnostics data
    const diagnosticData = props.diagnosticData;
    // initial which issue from props
    const whichIssue = props.whichIssue;

    // initial main display
    let jocabianCondationDisplay: any = "Loading jocabian condation..."
    let modelStatisticsStructuralDisplay: any = "Loading model statistics structural..."
    let warningDisplay:any = "Loading warning...";
    let cautionDisplay:any = "Loading caution...";
    let configDisplay: any = "Loading config ...";
    let diagnosticSeverityDisplay:any = "Loading diagnostic result...";
    let nextStepDisplay:any = "Loading suggested next step...";

    let numberOfWarnings:number = 0;
    let numberOfCautions:number = 0;


    if(whichIssue && diagnosticData && diagnosticData.diagnostics_toolbox_report){
        // start populate diagnostics each display
        const tbxReport = diagnosticData.diagnostics_toolbox_report;

        
        // build jocabian condation
        jocabianCondationDisplay = <pre className={css.diagnostics_display_pre_tag}>{tbxReport.toolbox_jacobian_condation}</pre>

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
        }

        // when no next step, display default line from diagnostics toolbox
        // when has next step, populate next steps and display them
        if(!hasNextStep){
            // structural default
            if(whichIssue == "structural") nextStepDisplay = "Try to initialize solve your model and then call report_structural_issues()";
            // numerical default
            if(whichIssue == "numerical") nextStepDisplay = "Try to initialize solve your model and then call report_numerical_issues()";
        }else{
            // base on nextStepData build nextStepDisplay
            nextStepDisplay = nextStepsData.map((eachNextStep: string, index:number)=>{
                return(
                    <p key={`diagnostics_suggested_next_step_${eachNextStep}`}
                        className={`${css.diagnostics_display_each_next_step_content}`}
                        onClick={clickCopyToClipboard}
                    >
                        <span className="function_name">{eachNextStep}</span> 
                        <FontAwesomeIcon icon={faCopy} />
                    </p>
                )
            })
        }
        
    }

    return(
        <div className={`${css.diagnostics_display_main_container}`}>
            {/*Model Statistics*/}
            <div className={css.diagnostic_display_each_section_container}>
                <p className={css.diagnostic_display_section_title}>Model Statistics</p>
                { 
                    whichIssue == "structural" || !whichIssue ? 
                        modelStatisticsStructuralDisplay : 
                        jocabianCondationDisplay
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
    let contentWillCopy = target.querySelector('.function_name');

    // make sure contentWillCopy is there or return
    if(!contentWillCopy){
        console.error("There is an issue with click copy next step function")
        return;
    }

    const textToCopy = contentWillCopy.textContent || "";
    // copy to clip board
    navigator.clipboard.writeText(textToCopy).then(() => {
        // when coping, add class to p tag to create a copied label
        target.classList.add(css.copied_next_step)
        // after 1.3s remove that new assigned label
        let timeOut = setTimeout(()=>{
            target.classList.remove(css.copied_next_step)
            clearTimeout(timeOut);
        },1300)
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}