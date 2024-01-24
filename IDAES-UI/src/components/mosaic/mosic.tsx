import { useContext } from 'react';
import { AppContext } from '@/context/appMainContext';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons'

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
import StreamTable from '../flowsheet_main_component/stream_table_component/stream_table';

// interface
import { FvHeaderStateInterface } from '@/interface/appMainContext_interface';

// define ViewId
export type ViewId = 'components' | 'flowsheet' | 'diagnostics' | 'streamTable' |'new';

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    components: <Flowsheet_variable />,
    flowsheet: <Flowsheet />,
    diagnostics: <FlowsheetDiagnostics />,
    streamTable: <StreamTable />,
};

const TITLE_MAP:any = {
    components: 'Components',
    flowsheet: 'Diagram',
    diagnostics: 'Diagnostics',
    streamTable: 'Stream Table'
};

const MosaicApp = () => {
    // extract context
    const {panelState, fvHeaderState, setFvHeaderState} = useContext(AppContext)
    const isShowSteamName = fvHeaderState.isShowSteamName;
    const isShowLabels = fvHeaderState.isShowLabels;

    const renderTile = (id:any, path:any) => {
        // initial default toobarBtn use fragment
        let toolBarBtn = <></> 
        // conditionally render toolbarBtn
        toolBarBtn = conditionallyRenderBtn(id, showSteamNameHandler, showLabelsHandler, isShowSteamName, isShowLabels)
        
        return (
            <MosaicWindow<ViewId>
                path={path}
                createNode={() => 'new'}
                title={TITLE_MAP[id]}
                // toolbarControls
                toolbarControls={
                    toolBarBtn
                }
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
                    splitPercentage: 70,
                },
                second: 'streamTable',
                splitPercentage: 70,
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
function conditionallyRenderBtn(id:string, showSteamNameHandler:() => void, showLabelsHandler:() => void, isShowSteamName:boolean, isShowLabels:boolean){
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
        default:
            return<></>
            break;
    }
}

export default MosaicApp;