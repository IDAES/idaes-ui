import css from "./DiagnosticsHeader.module.css";

export default function DiagnosticHeader(props:any) {
    // reading props from parent
    let diagnosticData = props.diagnosticData;
    // set default diagnostics issue display as loading...
    let displayDiagnosticIssues:any = "Loading...";

    if (diagnosticData) {
        // when diagnostics is loaded populate how many kinds of issues and update issue component display
        // get issues array
        let structuralIssues = diagnosticData.diagnostics_toolbox_report.structural_report.warning[0];
        let numericalIssues = diagnosticData.diagnostics_toolbox_report.numerical_report.warning[0];
        // initial issueTypes
        let issueTypes:any = {
            structural : structuralIssues.length,
            numerical: numericalIssues.length
        };

        // setup default issue when whichIssue is null
        const issueArray = Object.keys(issueTypes);
        let currentIssueName = ""
        if(!props.whichIssue && issueArray.length > 0){
            currentIssueName = issueArray[0];
        }else{
            currentIssueName = props.whichIssue;
        }

        // update issue component display
        displayDiagnosticIssues = issueArray.map((eachIssueName, index)=>{
            return(
                <div key={index} 
                    className={`${css.diagnosticIssues_each_issue} ${eachIssueName == currentIssueName ? css.activated : css.deactivated}`}
                    onClick={()=>props.toggleIssue(eachIssueName)}
                >
                    <p>
                        {eachIssueName} issues
                        <sup>{issueTypes[eachIssueName]}</sup>
                    </p>
                </div>
            )
        })
    } else {
        console.log(`Diagnostic data is not pass from parent!`)
    }

    return (
        <div className={css.diagnosticsIssues_container}>
            {displayDiagnosticIssues}
        </div>
    );
}