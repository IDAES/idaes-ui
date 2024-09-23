import { useContext, useEffect, useState, useId } from 'react';
import { AppContext } from '@/AppContext';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName, Percentage } from '@blueprintjs/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons';

//interface
import {
    ToggleStreamTableInLogInterface,
    DiagnosticsPanelParamsInterface
} from '@/interface/appMainContext_interface';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import "./DraggablePanel.css";

// Panel headers
import StreamTableHeader from '@/streamTable/StreamTableHeader';
import DiagnosticsLogHeader from '@/diagnosticLogs/DiagnosticsLogHeader';

// Panels
import Diagram from '@/diagram/Diagram';
import VariablePanel from '@/diagramVariable/DiagramVariable';
import DiagnosticsPanel from '@/diagnostics/Diagnostics';
import DiagnosticsLogPanel from '@/diagnosticLogs/DiagnosticsLog';
import StreamTable from '@/streamTable/StreamTable';


// interface
import { FvHeaderStateInterface } from '@/interface/appMainContext_interface';

// define ViewId
export type ViewId = 'components' | 'flowsheet' | 'diagnostics' | 'diagnosticsRunner' | 'streamTable' | 'streamTableAndDiagnostics' | 'new';

const DraggablePanel = () => {
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
    const [currentLayout, setCurrentLayout] = useState(setupDefaultMosaicLayout());

    /**
     * @Description this function use to update context "viewInLogPanel"
     * it controls bottom panel to render between diagnostics or stream table
     * it take one param.
     * @param clickedElementName use this clickedElementName to set viewInLogPanel.clickedElementName = true otherwise false
     */
    function toggleStreamTableDiagnosticsRunnerHandler(clickedElementName: string) {
        // validation when passed in param is not a valid viewInLogPanel key name, log and return.
        if (!Object.keys(viewInLogPanel).includes(clickedElementName)) {
            return;
        }
        // update state set viewInLogPanel.clickedElementName = true then show this panel, other false.
        setViewInLogPanel((prevState: ToggleStreamTableInLogInterface) => {
            const copyState = { ...prevState };
            Object.keys(copyState).forEach((el: string) => {
                if (el == clickedElementName) {
                    copyState[el] = true;
                } else {
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
    function diagnosticsRunnerOrStreamTableDisplay() {
        /**
         * 1.panelState.diagnostics.show == true, viewInLogPanel.diagnosticsLogs == true, bottom shows diagnostics log element.
         * 2.panelState.diagnostics.show == true, viewInLogPanel.streamTable == true, bottom shows streamTable element.
         * 3.panelState.diagnostics.show == false, bottom should only show stream table.
         */
        if (panelState.diagnostics.show === true && viewInLogPanel.diagnosticsLogs) {
            return <DiagnosticsLogPanel />
        }

        if (panelState.diagnostics.show === true && viewInLogPanel.streamTable === true) {
            return <StreamTable />
        }

        if (panelState.diagnostics.show === false) {
            return <StreamTable />
        }

        // default return a react fragment element contain error message.
        return <>Bottom panel display error cause by diagnosticsRunnerOrStreamTableDisplay</>;
    }

    // element map: what element will render as mosaic panel
    const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
        components: <VariablePanel />,
        flowsheet: <Diagram />,
        diagnostics: <DiagnosticsPanel />,
        streamTableAndDiagnostics: diagnosticsRunnerOrStreamTableDisplay(),
    };

    const TITLE_MAP: any = {
        components: 'Components',
        flowsheet: 'Diagram',
        diagnostics: 'Diagnostics',
        diagnosticsRunner: 'Diagnostics Runner',
        streamTable: 'Stream Table',
        streamTableAndDiagnostics: "Diagnostics Logs"
    };

    const renderTile = (id: any, path: any) => {
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
            <>
                {/* <MessageBar /> */}
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
                                                onClick={() => toggleStreamTableDiagnosticsRunnerHandler('streamTable')}
                                                className={`
                                                ${viewInLogPanel.streamTable ? "mosaic_header_toolbar_title_activate" :
                                                        "mosaic_header_toolbar_title_deactivate"
                                                    }
                                                mosaic_header_toolbar_title diagnostics_runner_panel_title
                                            `}
                                            >
                                                Stream Table
                                            </p>
                                            <p
                                                onClick={() => {
                                                    panelState.diagnostics.show && toggleStreamTableDiagnosticsRunnerHandler('diagnosticsLogs');
                                                }}
                                                className={`
                                                ${viewInLogPanel.diagnosticsLogs ? "mosaic_header_toolbar_title_activate" :
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
            </>
        );
    };

    /**
     * Here setState fns to toggle stream name and lable
     */
    //toggle show steam names
    function showSteamNameHandler() {
        setFvHeaderState((prev: FvHeaderStateInterface) => {
            let copyPrev = { ...prev, isShowSteamName: !prev.isShowSteamName };
            return copyPrev;
        })
    }

    //toggle show labels
    function showLabelsHandler() {
        setFvHeaderState((prev: FvHeaderStateInterface) => {
            let copyPrev = { ...prev, isShowLabels: !prev.isShowLabels };
            return copyPrev;
        })
    }

    /**
     * @Description Use for update current mosaic layout to local storage and state.
     * When panel change the mosaic change handler will call this function
     * @param layout Current mosaic layout obj
     * @triggers Mosaic component onChange event handler
     * @returns None
     */
    function mosaicLayoutChangeHandler(layout: any) {
        if (panelState.diagnostics.show) {
            updateDiagnosticsPanelLocation(layout);
        }

        localStorage.setItem('mosaicLayout', JSON.stringify(layout));

        // overwrite layout state every when change layout
        setCurrentLayout(() => {
            return layout;
        })
    }

    /**
     * @description use for update diagnostics panel location the updated diag panel params
     * use for restore diag panel to the correct position.
     * @params layout, the layout mosaic will pass in when handle window changes.
     */
    function updateDiagnosticsPanelLocation(layout: any) {
        let diagnosticsPanelParams: DiagnosticsPanelParamsInterface;
        let readDiagnosticsPanelParams = localStorage.getItem("diagnosticsPanelParams");

        if (readDiagnosticsPanelParams) {
            diagnosticsPanelParams = JSON.parse(readDiagnosticsPanelParams);
        } else {
            diagnosticsPanelParams = initialDiagnosticsPanelParams();
        }

        // read diagnostics location from and update to local storage
        Object.keys(layout).forEach(el => {
            if (layout[el] == "diagnostics") {
                diagnosticsPanelParams.direction = layout.direction;
                diagnosticsPanelParams.splitPercentage = layout.splitPercentage;
                diagnosticsPanelParams.diagnosticsPanelLocationInItem = el;
                diagnosticsPanelParams.diagnosticsPanelLocationInObj = undefined;
                diagnosticsPanelParams.diagnosticsPanelStayWith = undefined;
            }

            if (typeof layout[el] == "object") {
                Object.keys(layout[el]).forEach(subEl => {
                    if (layout[el][subEl] == "diagnostics") {
                        diagnosticsPanelParams.direction = layout[el].direction;
                        diagnosticsPanelParams.splitPercentage = layout[el].splitPercentage;
                        const otherPanelAt = subEl == "first" ? "second" : "first";
                        diagnosticsPanelParams.diagnosticsPanelStayWith = layout[el][otherPanelAt];
                        diagnosticsPanelParams["diagnosticsPanelLocationInItem"] = el;
                        diagnosticsPanelParams["diagnosticsPanelLocationInObj"] = subEl;
                    }
                })
            }
        })

        localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));
    }

    /**
     * @description Use for initial diagnostics panel params, 
     * The diagnostics panel params is use for locate where is the diagnostics should
     * stay at in mosaic window
     */
    function initialDiagnosticsPanelParams() {
        let diagnosticsPanelParams = localStorage.getItem("diagnosticsPanelParams");

        // if not found diagnostics panel params just initial it, if already has just ignore
        if (!diagnosticsPanelParams) {
            /**
             * explain naming of diagnosticsPanelParams:
             * diagnosticsPanel must be nested inside a obj so it must has:
             * 1. direction: for mosaic to know if it's: row or column.
             * 2. diagnosticsPanelLocationInItem: to check diag panel in which obj keys, 
             *      each key represent a panel.
             *      each key will show as first second etc.
             *      if one row only contain one element the value of that key is a string.
             *      if one row contain multiple elements it will show as a obj.
             * 3. diagnosticsPanelLocationInObj: if a row contain diag and other panel, that row is a obj.
             *      this use to store diag panel's order in that obj.
             */
            const diagnosticsPanelParams = {
                direction: "row",
                diagnosticsPanelParamsLocationInItem: "first",
                diagnosticsPanelLocationInObj: "second",
                diagnosticsPanelStayWith: "flowsheet",
                splitPercentage: 55
            }

            localStorage.setItem("diagnosticsPanelParams", JSON.stringify(diagnosticsPanelParams));

            return diagnosticsPanelParams;
        } else {
            return JSON.parse(diagnosticsPanelParams);
        }
    }

    /**
     * @description when first time start app there has no mosaic layout
     * this use for setup the mosaic layout
     * first second direction splitPercentage are mosaic's required way to write down the obj key
     * @returns  obj, mosaic layout
     */
    function setupDefaultMosaicLayout() {
        let mosaicLayout;
        if (panelState.diagnostics.show) {
            mosaicLayout = {
                "direction": "column",
                "first": {
                    "direction": "row",
                    "first": "flowsheet",
                    "second": "diagnostics",
                    "splitPercentage": 55
                },
                "second": "streamTableAndDiagnostics",
                "splitPercentage": 60
            };
        }

        // diagnostics not show
        if (!panelState.diagnostics.show) {
            mosaicLayout = {
                "direction": "column",
                "first": "flowsheet",
                "second": "streamTableAndDiagnostics",
                "splitPercentage": 60
            };
        }

        // localStorage.setItem("mosaicLayout", JSON.stringify(mosaicLayout));
        return mosaicLayout;
    }

    /**
     * @Description read current layout and diagnostics panel params then
     * base on diagnostics show or hide to update current layout
     * @returns up to date layout
     */
    function getMosaicLayout() {
        try {
            initialDiagnosticsPanelParams();

            if (panelState.diagnostics.show) {
                let copyCurrentLayout = JSON.parse(JSON.stringify(currentLayout));

                /**
                 * when panelState.diagnostics.show == true check layout has diagnostics panel or not
                 * if current layout not contain diagnostics panel. 
                 * use diagnosticsPanelParams to re-format copyCurrentLayout (insert diagnostics panel to its old spot)
                 * else directly return layout
                 * 
                 * have to have this because when diagnostics panel is off and change mosaic layout
                 * the mosaic will only update displayed panel obj and store to local storage
                 * this will make the diagnostics panel disappeared forever.
                 */
                if (!JSON.stringify(currentLayout).includes("diagnostics")) {
                    if (!localStorage.getItem("diagnosticsPanelParams")) {
                        initialDiagnosticsPanelParams();
                    }

                    const readDiagnosticsPanelParams = localStorage.getItem("diagnosticsPanelParams");
                    if (readDiagnosticsPanelParams) {
                        let diagnosticsPanelParams = JSON.parse(readDiagnosticsPanelParams);
                        /**
                         * This is for restore diagnostics panel when diagnostics panel stand alone and 
                         * panelState.show is false and change mosaic layout
                         */
                        if (!diagnosticsPanelParams.diagnosticsPanelLocationInObj) {
                            const otherPanelAt = diagnosticsPanelParams.diagnosticsPanelLocationInItem == "first" ? "second" : "first";
                            const rebuildOtherPanelObj = {
                                direction: copyCurrentLayout.direction ? copyCurrentLayout.direction : "row",
                                splitPercentage: copyCurrentLayout.splitPercentage ? copyCurrentLayout.splitPercentage : 55,
                                first: copyCurrentLayout['first'] ? copyCurrentLayout['first'] : "flowsheet",
                                second: copyCurrentLayout['second'] ? copyCurrentLayout['second'] : "streamTableAndDiagnostics",

                            }
                            copyCurrentLayout.direction = diagnosticsPanelParams.direction ? diagnosticsPanelParams.direction : "column";
                            copyCurrentLayout.splitPercentage = diagnosticsPanelParams.splitPercentage ? diagnosticsPanelParams.splitPercentage : 55;
                            copyCurrentLayout[diagnosticsPanelParams.diagnosticsPanelLocationInItem] = "diagnostics";
                            copyCurrentLayout[otherPanelAt] = rebuildOtherPanelObj;
                        }
                        /**
                         * This is for restore diagnostics panel when diagnostics panel stage nested with other panel in a obj
                         */
                        if (diagnosticsPanelParams.diagnosticsPanelLocationInObj) {
                            const stayWithPanelName = diagnosticsPanelParams.diagnosticsPanelStayWith ? diagnosticsPanelParams.diagnosticsPanelStayWith : "flowsheet";
                            let stayWithPanelKey = Object.keys(copyCurrentLayout).find(el => {
                                if (copyCurrentLayout[el] == stayWithPanelName) {
                                    return el
                                }
                            });
                            const otherPanelName = stayWithPanelName == "flowsheet" ? "streamTableAndDiagnostics" : "flowsheet";
                            const otherPanelAt = stayWithPanelKey == "first" ? "second" : "first";

                            // in case stayWithPanelKey undefined, assign to first.
                            if (!stayWithPanelKey) stayWithPanelKey = "first";

                            // const otherPanelAt = diagnosticsPanelParams.diagnosticsPanelLocationInObj == "first" ? "second" : "first";
                            const rebuildPanelWithDiagnosticsObj: any = {
                                direction: diagnosticsPanelParams.direction ? diagnosticsPanelParams.direction : "column",
                                splitPercentage: copyCurrentLayout.splitPercentage ? copyCurrentLayout.splitPercentage : 55,
                            }
                            rebuildPanelWithDiagnosticsObj[stayWithPanelKey] = stayWithPanelName;

                            // double check make sure stayWithPanelKey != diagnosticsPanelParams.diagnosticsPanelLocationInObj to avoid error
                            if (stayWithPanelKey == diagnosticsPanelParams.diagnosticsPanelLocationInObj) {
                                stayWithPanelKey == "first" ? diagnosticsPanelParams.diagnosticsPanelLocationInObj = "second" : diagnosticsPanelParams.diagnosticsPanelLocationInObj = "first";
                            }

                            rebuildPanelWithDiagnosticsObj[diagnosticsPanelParams.diagnosticsPanelLocationInObj] = "diagnostics";
                            copyCurrentLayout = JSON.parse(JSON.stringify(copyCurrentLayout));
                            copyCurrentLayout[stayWithPanelKey] = rebuildPanelWithDiagnosticsObj;
                            copyCurrentLayout[otherPanelAt] = otherPanelName;
                        }
                    }
                }
                // localStorage.setItem("mosaicLayout", JSON.stringify(copyCurrentLayout))
                return copyCurrentLayout;
            }

            /**
             * This handles when panelState.diagnostics.show if false to remove the diagnostics panel from mosaic layout
             */

            if (!panelState.diagnostics.show) {
                let copyLayoutHolder: string = JSON.stringify(currentLayout);
                let copyLayout: { [key: string]: any } = JSON.parse(copyLayoutHolder);

                // when diagnostics at first layer of mosaicLayout obj
                Object.keys(copyLayout).forEach(el => {
                    if (copyLayout[el] == "diagnostics") {
                        // remove diagnostics
                        delete copyLayout[el];
                        const otherPanelKey = el == "first" ? "second" : "first";
                        const copyOtherPanel = JSON.parse(JSON.stringify(copyLayout[otherPanelKey])); // make a deep copy of other panel obj
                        copyLayout["first"] = copyOtherPanel["first"];
                        copyLayout["second"] = copyOtherPanel["second"];
                        copyLayout["direction"] = copyOtherPanel["direction"];
                        copyLayout["splitPercentage"] = copyOtherPanel["splitPercentage"];

                    }
                })

                Object.keys(copyLayout).forEach(el => {
                    if (typeof copyLayout[el] == "object") {
                        Object.keys(copyLayout[el]).forEach(subEl => {
                            if (copyLayout[el][subEl] == "diagnostics") {
                                delete copyLayout[el][subEl];
                                if (copyLayout[el].first) {
                                    copyLayout[el] = copyLayout[el].first
                                } else {
                                    copyLayout[el] = copyLayout[el].second
                                }
                            }
                        })
                    }
                })

                return copyLayout;
            }
        } catch {
            console.log(`error in get mosaic layout rest layout`)
            setupDefaultMosaicLayout();
        }
    }

    useEffect(() => {
        // update default layout when panelState.diagnostics.show changes
        // this will trigger life cycle to re-render.
        setCurrentLayout(() => {
            const mosaicLayout = localStorage.getItem('mosaicLayout');
            if (mosaicLayout) {
                return JSON.parse(mosaicLayout);
            } else {
                return setupDefaultMosaicLayout();
            }
        })
    }, [panelState.diagnostics.show])


    return (
        <Mosaic<ViewId>
            renderTile={renderTile}
            // TODO: variable panel
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
            initialValue={
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
    id: string,
    showSteamNameHandler: () => void,
    showLabelsHandler: () => void,
    isShowSteamName: boolean,
    isShowLabels: boolean,
    nextStepsFunctionNameList: String[],
    setDiagnosticsRunnerDisplay: any,
    viewInLogPanel: any,
    setDiagnosticsRefreshState: any
) {
    /**
     *  use id from Mosaic > renderTile callback to conditionally render toolbar btn
     *  Args:
     *      id: string panel id defined in ELEMENT_MAP
     *      showSteamNameHandler: callback update state in context showSteamName
     *      showLabelsHandler: callback update state in context showLabels
     *      isShowSteamName: bool
     *      isShowLabels: bool
     */
    switch (id) {
        // render toolbar btn base on panel id
        case "components":
            return <div className="mosaic_toolbar_btn_container">
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
            return <div className="mosaic_toolbar_btn_container">
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
                                    <FontAwesomeIcon icon={faSquareCheck} className="mosaic_toolbar_diagram_view_icon_stroke_only" />
                                    :
                                    <FontAwesomeIcon icon={faSquare} className="mosaic_toolbar_diagram_view_icon_stroke_only" />
                            }
                            <span>Stream Name</span>
                        </li>
                        <li id="show-label-toggle" onClick={showLabelsHandler} data-toggle={isShowLabels ? "false" : "true"}>
                            {
                                isShowLabels
                                    ?
                                    <FontAwesomeIcon icon={faSquareCheck} className="mosaic_toolbar_diagram_view_icon_stroke_only" />
                                    :
                                    <FontAwesomeIcon icon={faSquare} className="mosaic_toolbar_diagram_view_icon_stroke_only" />
                            }
                            <span>Labels</span>
                        </li>
                    </ul>
                </Button>
                {/*download*/}
                <Button id="diagram_download_icon" className="mosaic_flowsheet_header_download" minimal>
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
            function diagnosticsRefreshHandler() {
                setDiagnosticsRefreshState((prev: boolean) => !prev);
            }

            return <div className="mosaic_toolbar_btn_container">
                <p className="mosaic_diagnostic_toolbar_content">BLOCK: FLOWSHEET</p>
                <div
                    className="mosaic_toolbar_btn_icon_with_text clickable_btn"
                    onClick={() => diagnosticsRefreshHandler()}
                >
                    <Icon icon={IconNames.REFRESH} size={20} />
                    <span className="mosaic_toolbar_btn_icon_with_text_text">Refresh</span>
                </div>
            </div>
            break;
        case "streamTable":
            return <div className="mosaic_toolbar_btn_container">
                <StreamTableHeader />
            </div>
            break;
        case "streamTableAndDiagnostics":
            return <div className="mosaic_toolbar_btn_container">
                {!viewInLogPanel.diagnosticsLogs && <StreamTableHeader />}
                {viewInLogPanel.diagnosticsLogs && <DiagnosticsLogHeader />}
            </div>
            break
        case "diagnosticsRunner":
            const options = nextStepsFunctionNameList.map((el, index) => <option value={`${el}`} key={`diagnosticsRunnerSelection${el}`}>{el}</option>)
            /**
             * @description handle diagnostics runner displayer header selector change update diagnosticsRunnerDisplay value in context to decide which 
             * runned next steps to display
             * @param event select element change event
             */
            function diagnosticsRunnerSelectChangeHandler(event: React.ChangeEvent<HTMLSelectElement>) {
                setDiagnosticsRunnerDisplay(event.currentTarget.value)
            }
            return (
                <div className="mosaic_toolbar_btn_container">
                    <select name="diagnosticsRunnerSelection" id="" className="mosaic_diagnosticsRunner_select" onChange={diagnosticsRunnerSelectChangeHandler}>
                        <option value="default">Select a function</option>
                        {options}
                    </select>
                </div>
            )
        default:
            return <></>
            break;
    }
}

export default DraggablePanel;