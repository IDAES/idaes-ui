import css from "./diagnostics_issues.module.css";

export default function DiagnosticIssues(props:any) {
    let diagnosticData = props.diagnosticData; // reading props from parent
    let displayDiagnosticIssues:any = "Loading...";

    if (diagnosticData) {
        // start update template displayDiagnosticIssues
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

        displayDiagnosticIssues = Object.keys(issueTypes).map((el, index)=>{
            return(
                <div key={index} className={`${css.diagnosticIssues_each_issue} ${index == 0 ? css.activated : css.deactivated}`}>
                    <p>
                        {el} issues
                        <sup>{issueTypes[el]}</sup>
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