import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/context/appMainContext';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons'

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
import StreamTable from '../flowsheet_main_component/stream_table_component/stream_table';

// interface
import { FvHeaderStateInterface } from '@/interface/appMainContext_interface';

// define ViewId
export type ViewId = 'components' | 'flowsheet' | 'diagnostics' | 'diagnosticsRunner' | 'streamTable' | 'streamTableAndDiagnostics' | 'new' ;

const MosaicApp = () => {
    // extract context
    const {
        panelState, 
        fvHeaderState, 
        setFvHeaderState, 
        diagnosticsRunFnNameListState, 
        setDiagnosticsRunnerDisplayState,
        viewInLogPanel,
		setViewInLogPanel,
    } = useContext(AppContext);

    const isShowSteamName = fvHeaderState.isShowSteamName;
    const isShowLabels = fvHeaderState.isShowLabels;

    function toggleStreamTableDiagnosticsRunnerHandler(clickedElementName:string){
        if(!Object.keys(viewInLogPanel).includes(clickedElementName)){
            console.log(`key not found`)
        }
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
     * @description conditionally render JSX element to bottom log panel.
     * @param None
     * @returns JSX element use to display in bottom mosaic panel. now is flowsheet diagnostics panel or stream table panel
     */
    function diagnosticsRunnerOrStreamTableDisplay(){
        if(panelState.diagnostics.show && viewInLogPanel.diagnosticsLogs){
            return <FlowsheetDiagnosticsRunner/>
        }else{
            return <StreamTable/>
        }
    }

    // element map: what element will render as mosaic panel
    const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
        components: <Flowsheet_variable />,
        flowsheet: <Flowsheet />,
        diagnostics: <FlowsheetDiagnostics />,
        // diagnosticsRunner: <FlowsheetDiagnosticsRunner />,
        // streamTable: <StreamTable />,
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
        toolBarBtn = conditionallyRenderBtn(id, showSteamNameHandler, showLabelsHandler, isShowSteamName, isShowLabels, diagnosticsRunFnNameListState, setDiagnosticsRunnerDisplayState,viewInLogPanel)
        
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
                                            onClick={()=>toggleStreamTableDiagnosticsRunnerHandler('diagnosticsLogs')}
                                            className={`
                                                ${
                                                    viewInLogPanel.diagnosticsLogs ?      "mosaic_header_toolbar_title_activate" :
                                                    "mosaic_header_toolbar_title_deactivate"
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
                                conditionallyRenderBtn(
                                    id, 
                                    showSteamNameHandler, 
                                    showLabelsHandler, 
                                    isShowSteamName, 
                                    isShowLabels, 
                                    diagnosticsRunFnNameListState, 
                                    setDiagnosticsRunnerDisplayState,
                                    viewInLogPanel
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
     * Check if show diagnostics or streams in bottom view
     * TODO:
     * diagnostics shows diagnostics log should show, also can toggle between diagnostics and stream tables
     * it should remember user's perferance
     * diagnostics not show diagnostics log should not show,
     */

    // const streamTableShow = panelState.streamTable.show;
    // const diagnosticsShow = panelState.diagnostics.logs.show;

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
            initialValue={{
                direction: 'column',
                first: {
                    direction: 'row',
                    first: 'flowsheet',
                    second: 'diagnostics',
                    splitPercentage: panelState.diagnostics.show ? 70 : 100, //splitPercentage controls how wide split view is
                },
                second:'streamTableAndDiagnostics',
                splitPercentage: 60,
            }}
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
function conditionallyRenderBtn(
    id:string, 
    showSteamNameHandler:() => void, 
    showLabelsHandler:() => void, 
    isShowSteamName:boolean, 
    isShowLabels:boolean, 
    nextStepsFunctionNameList:String[], 
    setDiagnosticsRunnerDisplay:any,
    viewInLogPanel:any
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
                    <ul className="mosaic_dropdown_download">
                        <li id="headerExportImageBtn">Export PNG</li>
                        <li>Export SVG</li>
                    </ul>
                </Button>
            </div>
            break;
        case "diagnostics":
            return<div className="mosaic_toolbar_btn_container">
                <p className="mosaic_diagnostic_toolbar_content">BLOCK: FLOWSHEET</p>
                <div className="mosaic_toobar_btn_icon_with_text clickable_btn">
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