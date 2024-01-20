import { config } from "@fortawesome/fontawesome-svg-core";
import css from "./diagnostics_display.module.css";

export default function DiagnosticsDisplay(props:any){
    // initial diagnostics data
    const diagnosticData = props.diagnosticData;
    // initial which issue from props
    const whichIssue = props.whichIssue;

    // initial main display
    let config_display: any = "Loading config ...";
    let diagnostic_main_display:any = "Loading diagnostic result...";
    let next_step_display:any = "Loading suggested next step...";
    
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
         * 1. config display
         * 2. build each severity detail content
         * 3. build container for each severity and insert each severity detail content init
         */
        // build config display
        const config = diagnosticData.config;
        if(config && Object.keys(config).length > 0){
            config_display = Object.keys(config).map((eachConfigKey: string, index:number)=>{
                return(
                    <div key={`diagnostic_config_key_${index}`} className={`${css.diagnostic_display_each_config_container}`}>
                        <p>{eachConfigKey}: </p>
                        <p>{config[eachConfigKey]}</p>
                    </div>
                )
            })
        }else{
            config_display = "Diagnostic config not found."
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

        // build main display
        diagnostic_main_display = Object.keys(severityStore).map((eachSeverity:any, index:number)=>{
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
                {config_display}
            </div>
            <div className={css.diagnostic_display_each_section_container}>
                {diagnostic_main_display}
            </div>
            <div className={css.diagnostic_display_each_section_container}>
                {next_step_display}
            </div>
        </div>
    )
}