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
        //loop through diagnostics data push key to diagnosticsDOMSection
        Object.keys(diagnosticsData).forEach((el:string)=>{
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
                    <p class="diagnostics-section_title">
                        ${this.diagnosticsDOMSections[i]}
                    </p>
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
        
        //base on data.conf data create <p> insert to diagnosticConfigContentContainer
        Object.keys(data.config).forEach((eachConfig)=>{
            let formatConfigKey = eachConfig.replace(/_/g, ' ');
            diagnosticConfigContentContainer.innerHTML += `
                <div class="diagnostics_config_each_container">
                    <p class="diagnostics_config_key">${formatConfigKey}</p>
                    <div class="diagnostics_config_value_container">
                        <p class="diagnostics_config_tag_container">Value</p>
                        <p class="diagnostics_config_content">${data.config[eachConfig]}</p>
                    </div>
                </div>
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
        const issuesData = data.issues.issues;
        //generate issues category
        issuesData.forEach((eachIssue:any,index:string)=>{
            //create serverity title and description
            const categoryWrapper = document.createElement("div");
            categoryWrapper.classList.add("diagnostics-issues_category");
            //index to identify which target been clicked then use that index in issues data objects[i] to read data.
            categoryWrapper.setAttribute("index", index)
            //wrapper is <div class="diagnostics-issues_category"></div>
            categoryWrapper.innerHTML = `
            <p class="diagnostics-issue_title issue_serverity_caution">${eachIssue["severity"]}:</p>
            <p class="diagnostics-issue_title">Issue type: ${eachIssue["type"]}</p>
            <p class="diagnostics-issue_title issue_description">Description: ${eachIssue["description"]}</p>
            <p class="diagnostics-issue_title">Type: ${eachIssue["objects"][0]["type"]}</p>
            <div class="diagnostics-issue_click_detail">View Detail</div>
            `;
            diagnosticIssuesContentContainer.append(categoryWrapper);
            diagnosticIssuesContentContainer.addEventListener("click", (event:MouseEvent)=>{
                this.clickGenerateDetailForIssue(event, issuesData)
            })
            
            // //create issue detail
            // eachIssue["objects"].forEach((issueDetailObj:any)=>{
            //     const issueDetailContainer = document.createElement("div");
            //     issueDetailContainer.classList.add("diagnostics-each_issue_detail_container");
                
            //     //wrapper is <div class="diagnostics-each_issue_detail_container"></div>
            //     Object.keys(issueDetailObj).forEach((eachContent:string)=>{
            //         if(eachContent != "type"){
            //             const dom = `
            //                 <div class="diagnostics_each_issue_detail_row">
            //                     <p class="diagnostics-each_issue_name">${eachContent}</p>
            //                     <p class="diagnostics-each_issue_detail">${issueDetailObj[eachContent]}</p>
            //                 </div>
            //             `;
            //             issueDetailContainer.innerHTML += dom;
            //         }
            //     })
            //     categoryWrapper.append(issueDetailContainer);
            // })
        })

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