import { config } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";

export class Diagnostic_main{
    url : string;
    diagnosticsData : string | undefined;
    diagnosticsDOMSections : Array<string>;

    constructor(url:string){
        this.url = url;
        this.diagnosticsData = "";
        this.diagnosticsDOMSections = [];

        // initialize diagnostics
        this.initialize();
    }

    /**
     * initialize diagnostic
     * 1. fetch data
     * 2. validate data assign to this
     * 3. generate basic DOM structure base on this.diagnosticsData
     */
    async initialize(){
        try{
            //fetch data and validate then assign to this.diagnosticsData
            this.diagnosticsData = await this.fetchData(this.url);

            //validate diagnostic data
            if(!this.diagnosticsData){
                console.log(`Dagnostics data not found.`);
                return;
            }

            //Generate basic DOM structure
            this.generateBasicDOMStructure(this.diagnosticsData);

            //Generate content for each section
            this.generateEachCategoryForDOM(this.diagnosticsDOMSections, this.diagnosticsData);

        }catch(error){
            console.log(error)
        }
    }

    /**
     * @description this function fetch diagnostics data base on url
     * @param url a string url use to fetch diagnostics 
     * @returns diagnostic data in json
     */
    async fetchData(url:string){
        try{
            let diagnosticData : any = await axios.get(url);
            return diagnosticData.data;
        }catch(error){
            return "loading... data may not exist please check network"
        }
    }

    /**
     * @description this function base on diagnostics data generate sections
     * @param diagnosticDataObj this.diagnosticsDataObj
     * @returns Array of sections name
     */
    generateBasicDOMStructure(diagnosticsData:any){
        //read keys from JSON data
        const allSectionKey = Object.keys(diagnosticsData);
        
        //Base on the section order defind in array below, we filter out if any not in the JSON data
        let sectionOrder:Array<string> = ["issues", "config", "statistics"];
        sectionOrder.forEach((el:string)=>{
            if(!allSectionKey.includes(el)){
                el = "";
            }
        });
        sectionOrder = sectionOrder.filter((el:string)=> el != "" && el);

        //check if some all section not in section orders if so push into section order
        allSectionKey.forEach((el:string) => {
            if(!sectionOrder.includes(el)){
                sectionOrder.push(el)
            }
        })

        //loop through diagnostics data push key to diagnosticsDOMSection
        sectionOrder.forEach((el:string)=>{
            this.diagnosticsDOMSections.push(el);
        })

        //get DOM element diagnosticsContainer
        const diagnosticsContainer = document.getElementById("diagnosticsContainer");

        //validate if diagnosticsContainer exist;
        if(!diagnosticsContainer){
            console.log("diagnosticsContainer not found!")
            return;
        }

        //clear DOM
        diagnosticsContainer.innerHTML = "";

        //loop diagnosticsDOMSections create dom element;
        for(let i = 0; i < this.diagnosticsDOMSections.length; i++){
            diagnosticsContainer.innerHTML += `
                <div id="diagnostics-${this.diagnosticsDOMSections[i]}" class="diagnostic-each_section">
                    <div class="diagnostics-section_title_container">
                        <p class="diagnostics-section_title">
                            ${this.diagnosticsDOMSections[i]}
                        </p>
                        <img src="/public/assets/image/normal_icon/triangle.png" class="diagnostics-section_title_expand_icon diagnostics-section_title_expand_icon_open">
                    </div>
                </div>
            `
        }
    }

    /**
     * @description base on diagnosticsDOMSectios and diagnosticsData generate each category
     * @param sections diagnosticsDOMSectios
     * @param data diagnosticsData
     */
    generateEachCategoryForDOM(sections:Array<string>, data:any){
        //define known section to make sure when new section shows and not render has an error show.
        const knownSection = ["config", "statistics", "issues"];
        const sectionsOrder = {
            issues: 1,
            config: 2,
            statistics: 3,
        }

        sections = sections.sort((a:any, b:any)=> {
            return a - b;
        })

        sections.forEach((section)=>{
            if(!knownSection.includes(section)){
                //log error not throw error to prevent render block
                console.log(`Warrning:`)
                console.log(`The diagnostics section ${section} is now a known section, please check diagnostics_main.tsx generateEachCategoryForDOM()`);
            }

            //base on section name generate section.
            //generate DOM for config content
            if(section === 'config'){
               this.generateDOMForConfig(data);
            }

            //generate DOM for statistics content
            if(section === 'statistics'){
                this.generateDOMForStatistics(data);
            }

            //Generate DOM for issues
            if(section === 'issues'){
                this.generateDOMForIssues(data);
            }
        })
    }


    //each DOM element generator
    /**
     * @description generate config content
     * @param data diagnostics data
     * @returns 
     */
    generateDOMForConfig(data:any){
        //get where to generate DOM
        const configSection = document.getElementById("diagnostics-config");

        //DOM element validation
        if(!configSection){
            console.log(`diagnostics config section not found`)
            return;
        }

        //new DOM element <div class="diagnostics-section_content_container"> append to configSection;
        const diagnosticConfigContentContainer = document.createElement("div");
        diagnosticConfigContentContainer.classList.add("diagnostics-section_content_container");
        configSection.appendChild(diagnosticConfigContentContainer);
        diagnosticConfigContentContainer.innerHTML += `
        <table class="diagnostics-config_table">
            <thead class="diagnostics-config_table_head">
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody id="diagnostics_config_table_body" class="diagnostics-config_table_body">
            </tbody>
        </table>
        `
        
        //get config table body
        const configTableBody = document.getElementById("diagnostics_config_table_body")
        //base on data.conf data create <p> insert to diagnosticConfigContentContainer
        Object.keys(data.config).forEach((eachConfig)=>{
            let formatConfigKey = eachConfig.replace(/_/g, ' ');
            configTableBody!.innerHTML += `
                <tr>
                    <td>${formatConfigKey}</td>
                    <td>${data.config[eachConfig]}</td>
                </tr>
            `
        })

        this.makeElementWithEqual(".diagnostics_config_key");
        this.makeElementWithEqual(".diagnostics_config_key");
    }

    /**
     * @description generate statistics content
     * @param data diagnostics data
     * @returns 
     */
    generateDOMForStatistics(data:any){
        //get where to generate DOM
        const statisticsSection = document.getElementById("diagnostics-statistics");

        //DOM element validation
        if(!statisticsSection){
            console.log(`diagnostics statistics section not found`)
            return;
        }

        const diagnosticStatisticsContentContainer = document.createElement("div");
        diagnosticStatisticsContentContainer.classList.add("diagnostics-section_content_container");
        statisticsSection.appendChild(diagnosticStatisticsContentContainer);

        //define data key name map
        const rowNameMap = {
            dof : "DoF",
            var : "variables",
            ineq : "inequalities",
            constr : "constraints",
            obj : "objects",
            block: "blocks",
            expr : "expressions"
        };
        
        //generate table with data
        Object.keys(data.statistics).forEach((eachStatistics:any)=>{
            //base on each statistic generate a row <div class="diagnostics-statistic_row">
            const statisticRow = document.createElement("div");
            statisticRow.classList.add("diagnostics-statistic_row");

            //create each statistic title and total
            //title
            const statisticTitle = document.createElement("div");
            statisticTitle.classList.add("diagnostics-statistic_title_container");
            //assign title with full name base on rowNameMap, if exist in dict show the full value if not show key in JSON
            statisticTitle.innerHTML = `<p class="diagnostics-statistic_title_content">
                ${
                    (rowNameMap as {[key: string]: string})[eachStatistics] ? 
                    (rowNameMap as {[key: string]: string})[eachStatistics] : 
                    eachStatistics
                }
            </p>`;
            
            //each statistic append title and total
            statisticRow.append(statisticTitle);

            //each row sub values
            Object.keys(data.statistics[eachStatistics]).forEach((subStatisticValue:any)=>{ 
                    const subValues = document.createElement("div");
                    subValues.classList.add("diagnostics-statistic_value_container");
                    subValues.innerHTML = `
                    <p class="diagnostics-statistic_each_tag">${subStatisticValue}</p>
                    <p class="diagnostics-statistic_each_content">
                        ${data.statistics[eachStatistics]["value"]}
                    </p>
                    `;
                    statisticRow.append(subValues);
            });

            diagnosticStatisticsContentContainer.appendChild(statisticRow);
        })
    }


    /**
     * @description generate issue overview content, the detail issue content will generate when trigger click event
     * @param data the diagnostics JSON
     */
    generateDOMForIssues(data:any){
        //get where to generate DOM
        const issuesSection = document.getElementById("diagnostics-issues");

        //DOM element validation
        if(!issuesSection){
            console.log(`diagnostics config section not found`);
            return;
        }

        //new DOM element <div class="diagnostics-section_content_container"> append to configSection;
        const diagnosticIssuesContentContainer = document.createElement("div");
        diagnosticIssuesContentContainer.classList.add("diagnostics-section_content_container");
        diagnosticIssuesContentContainer.classList.add("diagnostics-issues_sections");
        issuesSection.appendChild(diagnosticIssuesContentContainer);

        //get issues data
        //sort warning order
        interface Issue {
            type: string;
            severity: string;
            // other properties...
        }

        const severityOrder: { [key: string]: number } = {
            "warning": 1,
            "caution": 2,
            "next": 3
        };
          
        const issuesData = data.issues.issues.sort((a: Issue, b: Issue) => {
            return severityOrder[a.severity] - severityOrder[b.severity]
        });

        //generate quantity of severity
        const severity: { [key: string]: number } = {};
        issuesData.forEach((el:any)=>{
            if(severity[el.severity]){
                severity[el.severity] = severity[el.severity] + 1;
            }else{
                severity[el.severity] = 1
            }
        });

        //base on serverity key and quantity to generate different category
        // > 55 Warning
        // > 2 Caustion
        Object.keys(severity).forEach((el:string, index:number)=>{
            diagnosticIssuesContentContainer.innerHTML += `
                <div id="diagnostics-issue_${el}" class="diagnostics-issue_category_container">
                    <div class="diagnostics-severity_title_container">
                        <img src="/public/assets/image/normal_icon/triangle.png" class="diagnostics-issue_expand_icon diagnostics-issue_expand_icon_open">
                        <p class="issue_serverity_${el}">${severity[el]} <span class="diagnostics-issue_severity_title_severity">${el}</span></p>
                    </div>
                    <div id="diagnostics-${el}_content_container" class="diagnostics_issue_detail_content_container"></div>
                </div>
            `
        });

        issuesData.forEach((eachIssue:any,issueDataIndex:number)=>{
            //base on eachIssue's severity to find which container to add content warning caution next or others
            //the id defines in diagnosticIssuesContentContainer.innerHTM > div#diagnostics-${el}_content_container
            const currentCategoryContainer = document.getElementById(`diagnostics-${eachIssue["severity"]}_content_container`);
        });

        //loop through issues base on it severity to add content into different #diagnostics-${severity}_content_container
        issuesData.forEach((eachIssue:any,issueDataIndex:number)=>{
            //base on eachIssue's severity to find which container to add content warning caution next or others
            //the id defines in diagnosticIssuesContentContainer.innerHTM > div#diagnostics-${el}_content_container
            const currentCategoryContainer = document.getElementById(`diagnostics-${eachIssue["severity"]}_content_container`);
            //create template
            const dom = `
                <div class="diagnostics_issue_each_detail">
                    <div class="diagnostics_issue_each_detail_title_container">
                        <img src="/public/assets/image/normal_icon/triangle.png" class="diagnostics-issue_expand_icon ${issueDataIndex < 2 ? "diagnostics-issue_expand_icon_open" : "diagnostics-issue_expand_icon_open"}">
                        <span class="diagnostics_issue_each_detail_severity">${eachIssue["severity"]}</span> ${issueDataIndex+1}:  ${eachIssue["description"]}
                    </div>
                    <div class="diagnostics_issue_each_detail_content_container flex-row">
                        <img src="/public/assets/image/normal_icon/triangle.png" class="diagnostics-issue_expand_icon ${issueDataIndex < 1 ? "diagnostics-issue_expand_icon_open" : "diagnostics-issue_expand_icon_close"}">
                        <p>${eachIssue['name']} :  ${issueDataIndex < 100 ? eachIssue['objects'].length : ""}</p>
                    </div>
                    <div class="diagnostics-issue_search_bar_container flex-row" style="display : ${issueDataIndex < 2 ? "flex" : "none"}">
                        <img src="/public/assets/image/normal_icon/filter.png" class="diagnostics-issue_search_bar_icon" alt="search bar icon">
                        <input type="text" placeholder="Search" class="diagnostics-issue_search_bar">
                    </div>
                    <div id="diagnostics_issue_each_detail_content_container_${issueDataIndex}">
                    
                    </div>
                </div>
            `;

            //add template to innerHTML
            if(currentCategoryContainer){
                currentCategoryContainer.innerHTML += dom;
            }

            //generate detail which from JSON object > everything into detail
            const issueDetailContainer = document.getElementById(`diagnostics_issue_each_detail_content_container_${issueDataIndex}`);
            if(issueDetailContainer){
                eachIssue['objects'].forEach((el:any, index:number)=>{
                    if(issueDataIndex < 2){
                        const dom = `
                            <div class="diagnostics-issue_each_detail_final flex-row">
                                <p class="diagnostics-issue_each_detail_final_title">${eachIssue["type"]} issue, ${el.type}</p>
                                <p class="diagnostics-issue_each_detail_final_content">${el.name}</p>
                            </div>
                        `
                        issueDetailContainer.innerHTML += dom;
                    }
                })

            }

            this.makeElementWithEqual(".diagnostics-issue_each_detail_final_title")
        });
    }

    clickGenerateDetailForIssue(event:MouseEvent, issueObj:any){
        const current = event.target;
        console.log(current)
    }
    //each DOM element generator end


    /**
     * @description this function can make all elememts with same css class selector have a same with, the longest with
     * @param classSelector css class selector to select what elements you want to make their width equal
     * @returns 
     */
    makeElementWithEqual(classSelector:string){
        //read key's container length find longest one assign to all
        const elements = document.querySelectorAll(classSelector) as NodeListOf<HTMLElement>;

        //when no elements selected return
        if(!elements){
            console.log(`not find any element by "makeElementEqual(classSelector)"`);
            return;
        }

        //get longestKeyContainer with
        let longestKeyContainerWidth = 0;
        elements.forEach(el=>{
            if(el.clientWidth > longestKeyContainerWidth){
                console.log(el.style.padding) 
                longestKeyContainerWidth = el.clientWidth + 2;
            }
        });
        
        //assign longest key container with to all
        elements.forEach((el:HTMLElement)=>{
            el.style.width = `${longestKeyContainerWidth}px`;
        });
    }
}


// <div class="diagnostics_each_issue_detail_row">
//     <p class="diagnostics-each_issue_name">${eachContent}</p>
//     <p class="diagnostics-each_issue_detail">${issueDetailObj[eachContent]}</p>
// </div>