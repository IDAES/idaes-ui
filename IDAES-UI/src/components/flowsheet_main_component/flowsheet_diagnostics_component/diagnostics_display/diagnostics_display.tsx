import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import css from "./diagnostics_display.module.css";

export default function DiagnosticsDisplay(props:any){
    // initial diagnostics data
    const diagnosticData = props.diagnosticData;
    // initial which issue from props
    const whichIssue = props.whichIssue;

    // initial main display
    let jocabianCondationDisplay: any = "Loading jocabian condation"
    let configDisplay: any = "Loading config ...";
    let diagnosticSeverityDisplay:any = "Loading diagnostic result...";
    let nextStepDisplay:any = "Loading suggested next step...";
    
    // populate severity numbers
    let currentIssues = null;
    if(diagnosticData && diagnosticData.issues.issues){
        // initial severity store to store { severityType : numbers }
        const severityStore:any = {warning: 0, caution: 0};
        // initial issueTypes store to store { issueType : numbers }
        const issueTypes:any={}
        // initial issues read from diagnosticData
        let issues = diagnosticData.issues.issues;

        // build issueTypes
        // default issue is null in here we build obj to hold what issues we have
        for(let i in issues){
            const type = issues[i].type;
            if(issueTypes[type]){
                issueTypes[type] += 1;
            }else{
                issueTypes[type] = 1
            }
        }

        // setup default issue when whichIssue is null
        const issueArray = Object.keys(issueTypes);
        let currentIssueName = ""
        if(!props.whichIssue && issueArray.length >= 1){
            currentIssueName = issueArray[0];
        }else{
            currentIssueName = props.whichIssue;
        }

        // build severity
        for(let i in issues){
            if(issues[i].type == currentIssueName){
                const severity = issues[i].severity;
                if(severityStore[severity]){
                    severityStore[severity] += 1;
                }else{
                    severityStore[severity] = 1;
                }
            }
        }

        /**
         * build display here
         * > jacobian_condation display
         * > config display
         * > build each severity detail content
         * > build container for each severity and insert each severity detail content init
         */

        //build jacobian_condation display
        const jacobian_condation_arr : Array<string> = [];
        for(let i in issues){
            if(issues[i].jacobian_condation && !jacobian_condation_arr.includes(issues[i].jacobian_condation)){
                jacobian_condation_arr.push(issues[i].jacobian_condation)
            }
        }

        jocabianCondationDisplay = jacobian_condation_arr.map((each_jacobian_condation:string, index:number)=>{
            return(
                <p key={`jacobian_condation_${index}_value_${each_jacobian_condation}`}>
                    {each_jacobian_condation}
                </p>
            )
        })

        // build config display
        const config = diagnosticData.config;
        if(config && Object.keys(config).length > 0){
            configDisplay = Object.keys(config).map((eachConfigKey: string, index:number)=>{
                return(
                    <div key={`diagnostic_config_key_${index}`} className={`${css.diagnostic_display_each_config_container}`}>
                        <p>{eachConfigKey}: </p>
                        <p>{config[eachConfigKey]}</p>
                    </div>
                )
            })
        }else{
            configDisplay = "Diagnostic config not found."
        }


        // build diagnostics each severity detail content
        let issueObj:any = {}
        const diagnostic_content_detail = diagnosticData.issues.issues.map((eachIssue:any, eachIssueIndex:number)=>{
            for(let i in eachIssue.objects){
                // use to build issueObj to contain what type of issueObj and how many of them
                // example {var: 166, constraint: 153}
                if(issueObj[eachIssue.objects[i].type]){
                    issueObj[eachIssue.objects[i].type] += 1
                }else{
                    issueObj[eachIssue.objects[i].type] = 1
                }
            }

            if(eachIssue.type == currentIssueName){
                return (
                    <div key={eachIssueIndex} className={`${css.diagnostic_display_each_issue_container}`}>
                        <p>{`${issueObj[Object.keys(issueObj)[eachIssueIndex]]} `}</p>
                        <p>{`${Object.keys(issueObj)[eachIssueIndex]} `}</p>
                        <p >{eachIssue.name.replace("-", " ")}</p>
                    </div>
                )
            }
        })

        //build next step
        // read from diagnostics data issues to check if has next step
        let hasNextStep: boolean = false;
        for(let i in issues){
            if(issues[i].next_steps){
                hasNextStep = true;
                break;
            }
        }

        // when no next step, display default line from diagnostics toolbox
        // when has next step, populate next steps and display them
        if(!hasNextStep){
            // structural default
            if(whichIssue == "structural") nextStepDisplay = "Try to initialize/solve your model and then call report_structural_issues()";
            // numerical default
            if(whichIssue == "numerical") nextStepDisplay = "Try to initialize/solve your model and then call report_numerical_issues()";
        }else{
            // array store unique next step, and read from each issue assign them to nextStepDisplayArray
            // TODO: n^2? too slow, a way to fix this is to build next steps as a key in diagnostics obj as a key value pair, not in each issue
            let nextStepDisplayArr: Array<string>= [];
            for(let i in issues){
                if(issues[i].next_steps){
                    let eachIssuesNextStep = issues[i].next_steps;
                    for(let j in eachIssuesNextStep){
                        if(!nextStepDisplayArr.includes(eachIssuesNextStep[j])){
                            nextStepDisplayArr.push(eachIssuesNextStep[j])
                        }
                    }
                }
            }
            nextStepDisplay = nextStepDisplayArr.map((eachNextStep: string, index:number)=>{
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

        //

        // build main display
        diagnosticSeverityDisplay = Object.keys(severityStore).map((eachSeverity:any, index:number)=>{
            return(
                <div key={`issue_title_severity_${index}`} className={`${css.diagnostics_display_each_severity_main_container}`}>
                    <div className={`${css.diagnostic_display_each_severity_title} ${css[eachSeverity]}`}>
                        {eachSeverity}
                        <span>{severityStore[eachSeverity]}</span>
                    </div>
                    {   
                        /*if severityStore's some severity is 0 then display this kind of severity not found! */
                        severityStore[eachSeverity] > 0 ?
                        <div className={css.diagnostic_display_diagnostic_content_container}>
                            {diagnostic_content_detail} 
                        </div> :
                        <div className={css.diagnostic_display_diagnostic_content_container}>
                            No {eachSeverity} found!
                        </div>
                    }
                </div>
            )
        })
    }

    //

    return(
        <div className={`${css.diagnostics_display_main_container}`}>
            <div className={css.diagnostic_display_each_section_container}>
                {jocabianCondationDisplay}
            </div>
            <div className={css.diagnostic_display_each_section_container}>
                {/* {configDisplay} */}
            </div>
            <div className={css.diagnostic_display_each_section_container}>
                {diagnosticSeverityDisplay}
            </div>
            <div className={css.diagnostic_display_each_section_container}>
                { 
                    nextStepDisplay != "Loading suggested next step..." && 
                    <p className={css.diagnostic_display_next_steps_title}>Suggested next steps:</p>
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