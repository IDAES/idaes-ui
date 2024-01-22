import { useContext } from 'react';
import { AppContext } from '@/context/appMainContext';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import "./mosaic.css";


// import flowsheet componets
import MinimizedBar from '../flowsheet_main_component/minimized_bar_component/minimized_bar_component';
import FlowsheetHeader from '../flowsheet_main_component/flowsheet_component/flowsheet_header/flowsheet_header_component';
import Flowsheet from '../flowsheet_main_component/flowsheet_component/flowsheet_component';
import FlowsheetDiagnostics from '../flowsheet_main_component/flowsheet_diagnostics_component/flowsheet_diagnostics_component';
import StreamTable from '../flowsheet_main_component/stream_table_component/stream_table';

export type ViewId = 'components' | 'flowsheet' | 'diagnostics' | 'streamTable' |'new';

function Components (){
    return (
        <p>Components should render here</p>
    )
}

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    components: <div><Components /></div>,
    flowsheet: <><FlowsheetHeader/><Flowsheet /></>,
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
    const {panelState} = useContext(AppContext)
    const renderTile = (id:any, path:any) => {
        // initial default toobarBtn use fragment
        let toolBarBtn = <></> 
        // conditionally render toolbarBtn
        toolBarBtn = conditionallyRenderBtn(id)
        
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
                {ELEMENT_MAP[id]}
            </MosaicWindow>
        );
    };

    return (
        <Mosaic<ViewId>
            renderTile={renderTile}
            initialValue={{
                direction: 'row',
                first: 'components',
                second: {
                direction: 'column',
                first: {
                    direction:'row',
                    first:'flowsheet',
                    second:'diagnostics',
                    splitPercentage: panelState.diagnostics.show ? 70 : 100, //splitPercentage controls how wide split view is
                },
                second: 'streamTable',
                splitPercentage: 60,
                },
                splitPercentage: 15,
            }}
        />
    );
};

function conditionallyRenderBtn(id:string){
    /**
     *  use id from Mosaic > renderTile callback to conditionally render toolbar btn
     *  Args:
     *      id: panel id defined in 
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
                <Button minimal>
                    <Icon icon={IconNames.ZOOM_IN} size={20} />
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.ZOOM_OUT} size={20} />
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.ZOOM_TO_FIT} size={20} />
                </Button>
                <Button className="mosaic_flowsheet_header_view" minimal>
                    <Icon icon={IconNames.EYE_OPEN} size={20} />
                    <ul className="mosaic_dropdown_view">
                        <li className="">
                            <input type="checkbox" name="" id="" />
                            <span>Stream Name</span>
                        </li>
                        <li className="">
                            <input type="checkbox" name="" id="" />
                            <span>Labels</span>
                        </li>
                    </ul>
                </Button>
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
                <Button icon={IconNames.MINIMIZE} minimal title="Close Window"/>
                <Button icon={IconNames.MAXIMIZE} minimal/>
                <Button icon={IconNames.CROSS} minimal />
            </div>
            break;
        case "streamTable":
            return<div className="mosaic_toolbar_btn_container">
                <Button minimal>
                    <Icon icon={IconNames.MINIMIZE} size={20} />
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.MAXIMIZE} size={20} />
                </Button>
                <Button minimal>
                    <Icon icon={IconNames.CROSS} size={20} />
                </Button>
            </div>
            break;
        default:
            return<></>
            break;
    }
}

export default MosaicApp;