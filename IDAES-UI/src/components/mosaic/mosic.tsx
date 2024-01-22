import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

export type ViewId = 'a' | 'b' | 'c' | 'd' |'new';

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    a: <div>Components</div>,
    b: <div>Diagram</div>,
    c: <div>Diagnostics</div>,
    d: <div>Stream Table</div>,
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
        {/* Content */}
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