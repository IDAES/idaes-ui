import css from "./diagnostics_issues.module.css";

export default function DiagnosticIssues(props:any) {
    // reading props from parent
    let diagnosticData = props.diagnosticData;
    // set default diagnostics issue display as loading...
    let displayDiagnosticIssues:any = "Loading...";

    if (diagnosticData) {
        // when diagnostics is loaded populate how many kinds of issues and update issue component display
        // get issues array
        let issues = diagnosticData.issues.issues;
        // initial issueTypes
        let issueTypes:any = {};
        // loop through issues and assign unique issue type to issueType array
        for(let i in issues){
            let issue = issues[i].type;
            if(issueTypes[issue]){
                issueTypes[issue] += 1
            }else{
                issueTypes[issue] = 1
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