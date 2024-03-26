import { Mosaic } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';


const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    flowsheetWindow: <div>Flowsheet container</div>,
    b: <div>Top Right Window</div>,
    c: <div>Bottom Right Window</div>,
  };
  
const MosaicApp = () => (
    <div id="app">
        <Mosaic
            renderTile={(id) => ELEMENT_MAP[id]}
            initialValue={{
                direction: 'row',
                first: 'flowsheetWindow',
                second: {
                    direction: 'column',
                    first: 'b',
                    second: 'c',
                },
                splitPercentage: 40,
            }}
        />
    </div>
  );


export default MosaicApp