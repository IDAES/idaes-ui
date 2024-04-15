import { useContext, useEffect, useState, useId } from 'react';
import { AppContext } from '@/context/appMainContext';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons';

//interface
import {ToggleStreamTableInLogInterface} from '@/interface/appMainContext_interface';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import "./mosaic.css";


// import flowsheet componets
import MinimizedBar from '../flowsheet_main_component/minimized_bar_component/minimized_bar_component';
import StreamTableHeader from '../flowsheet_main_component/stream_table_component/stream_table_header/stream_table_header';
import Flowsheet_variable from '../flowsheet_main_component/flowsheet_variables/flowsheet_variable_component';
import Flowsheet from '../flowsheet_main_component/flowsheet_component/flowsheet_component';
import FlowsheetDiagnostics from '../flowsheet_main_component/flowsheet_diagnostics_component/flowsheet_diagnostics_component';
import FlowsheetDiagnosticsRunner from '../flowsheet_main_component/flowsheet_diagnostics_runner_component/flowsheet_diagnostic_runner_component';
import DiagnosticsLogHeader from '../flowsheet_main_component/flowsheet_diagnostics_component/diagnostics_log_header/diagnostics_log_header_component';
import StreamTable from '../flowsheet_main_component/stream_table_component/stream_table';

// interface
import { FvHeaderStateInterface } from '@/interface/appMainContext_interface';

// define ViewId
export type ViewId = 'components' | 'flowsheet' | 'diagnostics' | 'diagnosticsRunner' | 'streamTable' | 'streamTableAndDiagnostics' | 'new' ;

const MosaicApp = () => {
    // extract context
    const {
        panelState, // which panel is show
        setPanelState, // use for update panel state
        fvHeaderState, // stream name labels show: true false
        setFvHeaderState, 
        diagnosticsRunFnNameListState, // array of diagnostics function names
        setDiagnosticsRunnerDisplayState,
        viewInLogPanel, // bottom panel toggle stream table or diagnostics logs
		setViewInLogPanel,
        setDiagnosticsRefreshState, // update diagnostics refresh by changing state bool to control useEffect
    } = useContext(AppContext);

    const isShowSteamName = fvHeaderState.isShowSteamName;
    const isShowLabels = fvHeaderState.isShowLabels;

    /**
     * @Description this function use to update context "viewInLogPanel"
     * it controls bottom panel to render between diagnostics or stream table
     * it take one param.
     * @param clickedElementName use this clickedElementName to set viewInLogPanel.clickedElementName = true otherwise false
     */
    function toggleStreamTableDiagnosticsRunnerHandler(clickedElementName:string){
        // validation when passed in param is not a valid viewInLogPanel key name, log and return.
        if(!Object.keys(viewInLogPanel).includes(clickedElementName)){
            return;
        }
        // update state set viewInLogPanel.clickedElementName = true then show this panel, other false.
        setViewInLogPanel((prevState:ToggleStreamTableInLogInterface)=>{
            const copyState = {...prevState};
            Object.keys(copyState).forEach((el:string)=>{
                if(el == clickedElementName){
                    copyState[el] = true;
                }else{
                    copyState[el] = false;
                }
            })
            return copyState
        })
    }

    /**
     * @description conditionally render JSX element to bottom log panel, 
     * it base on panelState.diagnostics.show and viewInLogPanel.
     * @param None
     * @returns JSX element use to display in bottom mosaic panel. now is flowsheet diagnostics panel or stream table panel.
     */
    function diagnosticsRunnerOrStreamTableDisplay(){
        /**
         * 1.panelState.diagnostics.show == true, viewInLogPanel.diagnosticsLogs == true, bottom shows diagnostics log element.
         * 2.panelState.diagnostics.show == true, viewInLogPanel.streamTable == true, bottom shows streamTable element.
         * 3.panelState.diagnostics.show == false, bottom should only show stream table.
         */
        if(panelState.diagnostics.show === true && viewInLogPanel.diagnosticsLogs){
            return <FlowsheetDiagnosticsRunner/>
        }
        
        if(panelState.diagnostics.show === true && viewInLogPanel.streamTable === true){
            return <StreamTable/>
        }

        if(panelState.diagnostics.show === false){
            return <StreamTable/>
        }

        // default return a react fragment element contain error message.
        return <>Bottom panel display error cause by diagnosticsRunnerOrStreamTableDisplay</>;
    }

    // element map: what element will render as mosaic panel
    const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
        components: <Flowsheet_variable />,
        flowsheet: <Flowsheet />,
        diagnostics: <FlowsheetDiagnostics />,
        streamTableAndDiagnostics: diagnosticsRunnerOrStreamTableDisplay(),
    };

    const TITLE_MAP:any = {
        components: 'Components',
        flowsheet: 'Diagram',
        diagnostics: 'Diagnostics',
        diagnosticsRunner: 'Diagnostics Runner',
        streamTable: 'Stream Table',
        streamTableAndDiagnostics: "Diagnostics Logs"
    };

    const renderTile = (id:any, path:any) => {
        // initial default toolbarBtn use fragment
        let toolBarBtn = <></>;
        // conditionally render toolbarBtn
        toolBarBtn = conditionallyRenderPanelHeaderBtn(
                        id, 
                        showSteamNameHandler, 
                        showLabelsHandler, 
                        isShowSteamName, 
                        isShowLabels, 
                        diagnosticsRunFnNameListState, 
                        setDiagnosticsRunnerDisplayState,
                        viewInLogPanel, 
                        setDiagnosticsRefreshState
                    );
        
        return (
            <MosaicWindow<ViewId>
                path={path}
                createNode={() => 'new'}
                title={TITLE_MAP[id]}

                //render customized header foe each panel
                renderToolbar={(title, path) => (
                    <div className="mosaic_customized_toolbar_header">
                        <div className="mosaic_customized_toolbar_title_container">
                            {
                                /**
                                 * Base on which title to render title display in panel header.
                                 * 
                                 * only when title is "diagnostics runner" which is means is the diagnostics panel
                                 * it needs to display 2 title stream table, and diagnostics runner
                                 * these two title use to click and toggle show diagnostics runner and stream table.
                                 */
                                TITLE_MAP[id] == TITLE_MAP.streamTableAndDiagnostics ?
                                    // for diagnostics runner panel
                                    <>
                                        <p 
                                            onClick={()=>toggleStreamTableDiagnosticsRunnerHandler('streamTable')}
                                            className={`
                                                ${
                                                    viewInLogPanel.streamTable ?      "mosaic_header_toolbar_title_activate" :
                                                    "mosaic_header_toolbar_title_deactivate"
                                                }
                                                mosaic_header_toolbar_title diagnostics_runner_panel_title
                                            `}
                                        >
                                            Stream Table
                                        </p>
                                        <p 
                                            onClick={()=>{
                                                panelState.diagnostics.show && toggleStreamTableDiagnosticsRunnerHandler('diagnosticsLogs');
                                            }}
                                            className={`
                                                ${  
                                                    viewInLogPanel.diagnosticsLogs ?      "mosaic_header_toolbar_title_activate" :
                                                    "mosaic_header_toolbar_title_deactivate"
                                                }

                                                ${
                                                    // css when diagnostics panel not open, the log tab in log panel should not display
                                                    !panelState.diagnostics.show &&
                                                    "mosaic_header_tool_bar_fully_deactivate"
                                                }
                                                mosaic_header_toolbar_title diagnostics_runner_panel_title
                                            `}
                                        >
                                            {TITLE_MAP[id]}
                                        </p>
                                    </> :
                                    // for other panels render one title only
                                    <p className="mosaic_header_toolbar_title">{TITLE_MAP[id]}</p>
                            }
                        </div>
                        <div className="mosaic_customized_toolbar_btn_container">
                            {   
                                // return toolbar elements template and render on page
                                conditionallyRenderPanelHeaderBtn(
                                    id, 
                                    showSteamNameHandler, 
                                    showLabelsHandler, 
                                    isShowSteamName, 
                                    isShowLabels, 
                                    diagnosticsRunFnNameListState, 
                                    setDiagnosticsRunnerDisplayState,
                                    viewInLogPanel,
                                    setDiagnosticsRefreshState
                                )
                            }
                        </div>
                    </div>
                )}
            >
                {/*Content is render here*/}
                {ELEMENT_MAP[id]}
            </MosaicWindow>
        );
    };

    /**
     * Here setState fns to toggle stream name and lable
     */
    //toggle show steam names
    function showSteamNameHandler(){
        setFvHeaderState((prev:FvHeaderStateInterface)=>{
            let copyPrev = {...prev, isShowSteamName : !prev.isShowSteamName};
            return copyPrev;
        })
    }

    //toggle show labels
    function showLabelsHandler(){
        setFvHeaderState((prev:FvHeaderStateInterface)=>{
            let copyPrev = {...prev, isShowLabels : !prev.isShowLabels};
            return copyPrev;
        })
    }

    /**
     * Everything about handle layout on change
     * the mosaic layout will auto save to local storage 'mosaicLayout' when user make changes in UI 
     * handle by function mosaicLayoutChangeHandler, call in return Mosaic component onChange
     */
    interface DiagnosticsPanelParamsInterface {
        direction: "row" | "column";
        diagnosticsPanelLocationInItem: "first" | "second";
        diagnosticsPanelLocationInObj: "first" | "second";
        diagnosticsPanelStayWith: string;
        splitPercentage: number;
    }

    /**
     * @Description Use for update current mosaic layout to local storage as a string format.
     * @param layout Current mosaic layout obj
     * @triggers Mosaic component onChange event handler
     * @returns None
     */
    function mosaicLayoutChangeHandler(layout:any){
        // store layout to local storage
        let currentLayout = JSON.stringify(layout);
        const updatedMosaicLayout = updateDiagnosticsPanelLocation(layout);
        localStorage.setItem('mosaicLayout', currentLayout);
    }

    /**
     * @description use for initial diagnostics panel location, by reading
     * diagnosticsPanelParams from local storage and mosaicLayout's flowsheet location to assign
     * default diagnostics panel location.
     * When default diagnostics panel should stay with flowsheet panel, on it's right side.
     * When Mosaic onchange trigger to update diagnostics panel order
     * 
     * @params layout, the layout mosaic will pass in when handle window changes
     * 
     * @willDo setup or update local storage's diagnosticsPanelParams, it use for define diagnostics panel location.
     */

    // TODO: !issue here (maybe), when diagnostics is not on and just initial drag change flowsheet and table panel the diagnosticsPanelLocation.diagnosticsPanelLocationInItem InObj are gone, this cause diagnostics panel disappear
    function updateDiagnosticsPanelLocation(layout:any){
        // read mosaic layout from local storage
        let mosaicLayout = JSON.parse(localStorage.getItem('mosaicLayout')!);
        let diagnosticsPanelParams = JSON.parse(localStorage.getItem("diagnosticsPanelParams")!);

        // initial var for store diagnostics panel order from layout handler
        let currentDiagnosticsPanelLocationInItem: string;
        let currentDiagnosticsPanelLocationInObj: string;

        // read diagnostics panel order from layout when window drag or reorder
        Object.keys(layout).forEach(el=>{
            if(typeof(layout[el]) == "object"){
                Object.keys(layout[el]).forEach(subEl=>{
                    if(layout[el][subEl] == "diagnostics"){
                        currentDiagnosticsPanelLocationInItem = el;
                        currentDiagnosticsPanelLocationInObj = subEl;
                    }
                })
            }

            // here handle when diagnostics closed and switch flowsheet and stream table to update diagnosticsPanelParams
            if(typeof(layout[el]) == "string" && layout[el] == diagnosticsPanelParams.diagnosticsPanelStayWith){
                //  TODO:
            }
        })

        // check if current mosaic layout local stored diagnostics panel location is same as handler passed in diagnostics panel location
        // if not update it and use for store diagnostics panel order
        Object.keys(mosaicLayout).forEach(el=>{
            if(typeof(mosaicLayout) == "object"){
                Object.keys(mosaicLayout[el]).forEach(subEl=>{
                    if(mosaicLayout[el][subEl] == "diagnostics" && mosaicLayout[el][subEl] != currentDiagnosticsPanelLocationInObj){
                        diagnosticsPanelParams.diagnosticsPanelLocationInItem = currentDiagnosticsPanelLocationInItem;
                        diagnosticsPanelParams.diagnosticsPanelLocationInObj = currentDiagnosticsPanelLocationInObj;
                        console.log(subEl)
                    }
                })
            }
        })

        console.log(diagnosticsPanelParams)
        localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));

        return mosaicLayout;
    }

    /**
     * @description Use for initial diagnostics panel, The diagnostics panel params is use for locate where is the diagnostics should
     * stay at in mosaic window
     */
    function initialDiagnosticsPanelParams(){
        let diagnosticsPanelParams = localStorage.getItem("diagnosticsPanelParams");

        // if not found diagnostics panel params just initial it, if already has just ignore
        if(!diagnosticsPanelParams){
            /**
             * explain naming of diagnosticsPanelParams:
             * diagnosticsPanel must be nested inside a obj so it must has:
             * 1. direction: for mosaic to know if it's: row or column.
             * 2. diagnosticsPanelLocationInItem: to check it's in which obj keys, each key represent a panel.
             *    each key will show as first second etc.
             *    if one row only contain one element the value of that key is a string.
             *    if one row contain multiple elements it will show as a obj.
             * 3. diagnosticsPanelLocationInObj: diagnostics 100% in a obj to share row or column with other element,
             *    this key value represent in that element where is the diagnostics panel located.
             */
            const diagnosticsPanelParams = {
                "direction": "row",
                "diagnosticsPanelLocationInItem": "first",
                "diagnosticsPanelLocationInObj":"second",
                "diagnosticsPanelStayWith":"flowsheet",
                "splitPercentage":55
            }

            localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));
        }
    }
    
    /**
     * @Description read mosaic layout from local storage to initial layoutInLocalStorage.
     * if has layout in local storage get it parse it and return it 
     * if no layout in local storage return default layout
     * @returns mosaic layout obj
     */
    function getMosaicLayout(){
        // read mosaic layout from local storage
        let mosaicLayout:any = localStorage.getItem('mosaicLayout');

        // initial diagnostics panel location
        initialDiagnosticsPanelParams();
        
        // if has layoutInLocalStorage means there is a stored layout then parse it to Obj use as most recent layout.
        // layout is frequently updated when mosaic window on change
        if(mosaicLayout){
            // parse the local storage stored mosaic layout 
            mosaicLayout = JSON.parse(mosaicLayout);
            // parse the local storage diagnostics panel params this 100% there and update when mosaic window on change!
            const diagnosticsPanelParams = JSON.parse(localStorage.getItem("diagnosticsPanelParams")!);
            
            // when diagnostics panel is show restore diagnostics
            if(panelState.diagnostics.show){
                Object.keys(mosaicLayout).forEach((el)=>{
                    // check the mosaic layout item should contain diagnostics panel
                    if(el == diagnosticsPanelParams.diagnosticsPanelLocationInItem){
                        // when the element should contain diagnostics is a object: {first:{direction:"row", first:"flowsheet"...}}
                        if(typeof(mosaicLayout[el]) == "object"){
                            // reassign this panel obj with direction in diagnosticsPanelParams
                            if(diagnosticsPanelParams.direction){
                                mosaicLayout[el].direction = diagnosticsPanelParams.direction;
                            }else{
                                mosaicLayout[el].direction = "row"; // default value
                            }
                            // reassign reassign this panel obj with split percentage in diagnosticsPanelParams
                            if(diagnosticsPanelParams.splitPercentage){
                                mosaicLayout[el].splitPercentage = diagnosticsPanelParams.splitPercentage;
                            }else{
                                mosaicLayout[el].splitPercentage = 55; // default value
                            }

                            Object.keys(mosaicLayout[el]).forEach(subEl=>{
                                // this check and delete to prevent duplicated "diagnostics" assign to mosaicLayout
                                if(mosaicLayout[el][subEl] == "diagnostics"){
                                    delete mosaicLayout[el][subEl];
                                }
                                // reassign key values for direction splitPercentage, and diagnostics base on diagnosticsPanelParams
                                mosaicLayout[el][diagnosticsPanelParams.diagnosticsPanelLocationInObj] = "diagnostics";
                            })
                        }
                    
                        // when the element should contain diagnostics is a string: {first: "flowsheet"...}
                        // when mosaicLayout[el] is string rebuild it to obj
                        if(typeof(mosaicLayout[el]) == "string"){
                            // copy old panel value
                            const copyCurrentValue = mosaicLayout[el];
                            // initial a new obj to restore diagnostics panel init.
                            mosaicLayout[el] = {};
                            mosaicLayout[el].direction = diagnosticsPanelParams.direction;
                            // conditionally render diagnostics panel as first or second
                            mosaicLayout[el].first = diagnosticsPanelParams.diagnosticsPanelLocationInObj == "first" ? "diagnostics" : copyCurrentValue;
                            mosaicLayout[el].second = diagnosticsPanelParams.diagnosticsPanelLocationInObj == "second" ? "diagnostics" : copyCurrentValue;

                            mosaicLayout[el].splitPercentage = diagnosticsPanelParams.splitPercentage;
                        }
                    }

                })
            }

            // when diagnostics panel is hide, save current diagnostics panel's location info to diagnosticsPanelParam and remove diagnostics panel
            if(!panelState.diagnostics.show){
                Object.keys(mosaicLayout).forEach((el)=>{
                    if(el == diagnosticsPanelParams.diagnosticsPanelLocationInItem){
                        if(typeof(mosaicLayout[el]) == "object"){
                            Object.keys(mosaicLayout[el]).forEach(subEl=>{
                                if(mosaicLayout[el][subEl] == "diagnostics"){
                                    console.log(mosaicLayout)
                                    diagnosticsPanelParams.diagnosticsPanelLocationInItem = el;
                                    diagnosticsPanelParams.diagnosticsPanelLocationInObj = subEl;
                                    diagnosticsPanelParams.direction = mosaicLayout[el][subEl].direction;
                                    diagnosticsPanelParams.splitPercentage = mosaicLayout[el][subEl].splitPercentage;
                                    let otherPanel:string;
                                    subEl == "first" ? otherPanel = "second" : otherPanel = "first";
                                    mosaicLayout[el] = mosaicLayout[el][otherPanel];
                                }
                            })
                            localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));
                        }

                        console.log(mosaicLayout[el])
                        if(typeof(mosaicLayout[el]) == "string" && mosaicLayout[el] == "diagnostics"){
                            console.log(`in here now`)
                        }
                    }
                })
            }
        }else{
            // when no mosaic layout from local storage initial default mosaic layout
            // default panel layout is:
            // 1, diagram, 2. stream table
            // diagnostics panel should be closed

            // maker sure to set diagnostics.show == false if it's opened at start
            // if(panelState.diagnostics.show){
            //     setPanelState(()=>false);
            // }

            // initial default mosaic layout
            let defaultLayout
            
            if(!panelState.diagnostics.show){
                defaultLayout= {
                    "direction": "column",
                    "first":"flowsheet",
                    "second": "streamTableAndDiagnostics",
                    "splitPercentage": 60
                };
            }
            
            if(panelState.diagnostics.show){
                defaultLayout = {
                    "direction": "column",
                    "first":{
                        "direction": "row",
                        "first":"flowsheet",
                        "second":"diagnostics",
                        "splitPercentage":55
                    },
                    "second": "streamTableAndDiagnostics",
                    "splitPercentage": 60
                };
            }

            // assign mosaicLayout as defaultLayout
            mosaicLayout = defaultLayout;
            localStorage.setItem("mosaicLayout", JSON.stringify(mosaicLayout))
        }

        return mosaicLayout
    }


    return (
        <Mosaic<ViewId>
            renderTile={renderTile}
            ////mosaic panel with components (variable)
            // initialValue={{
            //     direction: 'row',
            //     first: 'components',
            //     second: {
            //     direction: 'column',
            //     first: {
            //         direction:'row',
            //         first:'flowsheet',
            //         second:'diagnostics',
            //         splitPercentage: panelState.diagnostics.show ? 70 : 100, //splitPercentage controls how wide split view is
            //     },
            //     second: 'streamTable',
            //     splitPercentage: 70,
            //     },
            //     splitPercentage: 15,
            // }}
            ////mosaic panel without components (variable)
            onChange={mosaicLayoutChangeHandler}
            initialValue = {
                getMosaicLayout() // this function returns mosaic layout
            }
        />
    );
};

/**
 * @description use id from Mosaic > renderTile callback to conditionally render toolbar btn
 * @param id string panel id defined in ELEMENT_MAP
 * @param showSteamNameHandler callback update state in context showSteamName
 * @param showLabelsHandler callback update state in context showLabels
 * @param isShowSteamName bool
 * @param isShowLabels bool
 * @returns 
 */
function conditionallyRenderPanelHeaderBtn(
    id:string, 
    showSteamNameHandler:() => void, 
    showLabelsHandler:() => void, 
    isShowSteamName:boolean, 
    isShowLabels:boolean, 
    nextStepsFunctionNameList:String[], 
    setDiagnosticsRunnerDisplay:any,
    viewInLogPanel:any,
    setDiagnosticsRefreshState:any
){
    /**
     *  use id from Mosaic > renderTile callback to conditionally render toolbar btn
     *  Args:
     *      id: string panel id defined in ELEMENT_MAP
     *      showSteamNameHandler: callback update state in context showSteamName
     *      showLabelsHandler: callback update state in context showLabels
     *      isShowSteamName: bool
     *      isShowLabels: bool
     */
    switch (id){
        // render toolbar btn base on panel id
        case "components":
            return<div className="mosaic_toolbar_btn_container">
                <Button minimal>
                    <Icon icon={IconNames.MINIMIZE} size={20}></Icon>
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.MAXIMIZE} size={20}></Icon>
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.CROSS} size={20}></Icon>
                </Button>
            </div>
            break;
        case "flowsheet":
            return<div className="mosaic_toolbar_btn_container">
                {/*zoom*/}
                <Button id="zoom-in-btn" minimal>
                    <Icon icon={IconNames.ZOOM_IN} size={20} />
                </Button>
                <Button id="zoom-out-btn" minimal>
                    <Icon icon={IconNames.ZOOM_OUT} size={20} />
                </Button>
                <Button id="zoom-to-fit" minimal>
                    <Icon icon={IconNames.ZOOM_TO_FIT} size={20} />
                </Button>
                {/*views*/}
                <Button className="mosaic_flowsheet_header_view" minimal>
                    <Icon icon={IconNames.EYE_OPEN} size={20} />
                    <ul className="mosaic_dropdown_view">
                        <li id="stream-names-toggle" onClick={showSteamNameHandler} data-toggle={`${isShowSteamName}`}>
                        {
                            isShowSteamName
                            ?
                            <FontAwesomeIcon icon={faSquareCheck} className="mosaic_toolbar_diagram_view_icon_stroke_only"/>
                            :
                            <FontAwesomeIcon icon={faSquare} className="mosaic_toolbar_diagram_view_icon_stroke_only"/>
                        }
                            <span>Stream Name</span>
                        </li>
                        <li id="show-label-toggle" onClick={showLabelsHandler} data-toggle={isShowLabels ? "false" : "true"}>
                            {
                                isShowLabels 
                                ?
                                <FontAwesomeIcon icon={faSquareCheck} className="mosaic_toolbar_diagram_view_icon_stroke_only"/>
                                :
                                <FontAwesomeIcon icon={faSquare} className="mosaic_toolbar_diagram_view_icon_stroke_only"/>
                            }
                            <span>Labels</span>
                        </li>
                    </ul>
                </Button>
                {/*download*/}
                <Button className="mosaic_flowsheet_header_download" minimal>
                    <Icon icon={IconNames.BRING_DATA} size={20} />
                    <ul 
                        id="flowsheet_component_header_dropdown_container" className="mosaic_dropdown_download"
                    >
                        <li id="headerExportImageBtn">Export PNG</li>
                        <li id="headerExportSvgBtn">Export SVG</li>
                    </ul>
                </Button>
            </div>
            break;
        case "diagnostics":
            function diagnosticsRefreshHandler(){
                setDiagnosticsRefreshState((prev:boolean) => !prev);
            }

            return<div className="mosaic_toolbar_btn_container">
                <p className="mosaic_diagnostic_toolbar_content">BLOCK: FLOWSHEET</p>
                <div 
                    className="mosaic_toobar_btn_icon_with_text clickable_btn" 
                    onClick={()=>diagnosticsRefreshHandler()}
                >
                    <Icon icon={IconNames.REFRESH} size={20} />
                    <span className="mosaic_toobar_btn_icon_with_text_text">Refresh</span>
                </div>
            </div>
            break;
        case "streamTable":
            return<div className="mosaic_toolbar_btn_container">
                <StreamTableHeader />
            </div>
            break;
        case "streamTableAndDiagnostics":
            return<div className="mosaic_toolbar_btn_container">
                {!viewInLogPanel.diagnosticsLogs && <StreamTableHeader />}
                {viewInLogPanel.diagnosticsLogs && <DiagnosticsLogHeader />}
            </div>
            break
        case "diagnosticsRunner":
            const options = nextStepsFunctionNameList.map((el, index)=><option value={`${el}`} key={`diagnosticsRunnerSelection${el}`}>{el}</option>)
            /**
             * @description handle diagnostics runner displayer header selector change update diagnosticsRunnerDisplay value in context to decide which 
             * runned next steps to display
             * @param event select element change event
             */
            function diagnosticsRunnerSelectChangeHandler(event:React.ChangeEvent<HTMLSelectElement>){
                setDiagnosticsRunnerDisplay(event.currentTarget.value)
            }
            return(
                <div className="mosaic_toolbar_btn_container">
                    <select name="diagnosticsRunnerSelection" id="" className="mosaic_diagnosticsRunner_select" onChange={diagnosticsRunnerSelectChangeHandler}>
                        <option value="default">Select a function</option>
                        {options}
                    </select>
                </div>
            )
        default:
            return<></>
            break;
    }
}

export default MosaicApp;