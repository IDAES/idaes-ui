import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

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

export type ViewId = 'a' | 'b' | 'c' | 'd' |'new';

function Components (){
    return (
        <p>Components should render here</p>
    )
}

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    a: <div><Components /></div>,
    b: <><FlowsheetHeader/><Flowsheet /></>,
    c: <FlowsheetDiagnostics />,
    d: <StreamTable />,
};

const TITLE_MAP:any = {
    a: 'Components',
    b: 'Diagram',
    c: 'Diagnostics',
    d: 'Stream Table'
};

const MosaicApp = () => {
  const renderTile = (id:any, path:any) => {
    return (
      <MosaicWindow<ViewId>
        path={path}
        createNode={() => 'new'}
        title={TITLE_MAP[id]}
        toolbarControls
        // toolbarControls={
        //   <>
        //     <Button icon={IconNames.MINIMIZE} minimal title="Close Window"/>
        //     <Button icon={IconNames.MAXIMIZE} minimal />
        //     <Button icon={IconNames.CROSS} minimal />
        //   </>
        // }
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
            first: 'a',
            second: {
            direction: 'column',
            first: {
                direction:'row',
                first:'b',
                second:'c',
                splitPercentage: 70, //splitPercentage controls how wide split view is
            },
            second: 'd',
            splitPercentage: 60,
            },
            splitPercentage: 15,
        }}
    />
  );
};

export default MosaicApp;