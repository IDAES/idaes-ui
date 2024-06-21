import { createContext, useState, ReactNode, useEffect } from "react";
import { context_parse_url } from "./utility/contextFN_parse_url";
import { ToggleStreamTableInLogInterface } from "@/interface/appMainContext_interface";

export const AppContext = createContext<any>({});
export function AppContextProvider({ children }: { children: ReactNode }){
//read app setting from localstorage
const appSettingObj = readFromLocalStorage();
//get which env app is running on
const currentENV = import.meta.env.VITE_MODE;
//get python server running port;
const {server_port, fv_id} = context_parse_url() ?? { server_port: "49999", fv_id: "sample_visualization" };
// state for variable
const [showVariable, setShowVariable] = useState({})
//App panel control
const [panelState, setPanelState] = useState({
    fvWrapper : {
        panelName : "fvWrapper",
        show : true,
        size: {
            maxSize : 100,
            defaultSize: 70
        }
    },
    fv : {
        panelName : "Flowsheet",
        show : true,
        size: {
            minSize : 100,
            defaultSize: 70
        }
    },
    diagnostics:{
        panelName : "Diagnostics",
        // panel show state read from loacl storage.
        show : appSettingObj.diagnosticsPanelShow == undefined ? false : appSettingObj.diagnosticsPanelShow,
        size: {
            minSize : 100,
            defaultSize: 70
        }
    },
    diagnosticsLogs: {
        panelName : "Stream Table",
        show : false,
        size: {
            maxSize : 100,
            defaultSize: 30
        }
    },
    streamTable: {
        panelName : "Stream Table",
        show : true,
        size: {
            maxSize : 100,
            defaultSize: 30
        }
    },
    // report : {
    //   panelName : "Report",
    //   show : false
    // },
    // diagnostics : {
    //   panelName : "Diagnostics",
    //   show : true
    // },
});
//App panel control end

/**
 * Context for flowsheet
 */
const [fvHeaderState, setFvHeaderState] = useState({
    isShowSteamName : true,
    isShowLabels : false
})
/**
 * Context for diagnostics
 */
const [diagnosticsNextStepsOutputState, setDiagnosticsNextStepsOutputState] = useState({});
const [diagnosticsRunFnNameListState, setDiagnosticsRunFnNameListState] = useState([]);
const [diagnosticsRunnerDisplayState, setDiagnosticsRunnerDisplayState] = useState<String>("");
//use to switch between true and false to control useEffect to refetch backend to get the most recent diagnostics data
const [diagnosticsRefreshState, setDiagnosticsRefreshState] = useState<Boolean>(true);
const [diagnosticsHistoryState, setDiagnosticsHistory] = useState(0);

/**
 * Context for variables
 */
const [variablesExpandState, setVariablesExpandState] = useState({
    expand : false,
    expandState : {}
});

// context for toggle stream table and diagnostics in diagnostics runner panel
const [viewInLogPanel, setViewInLogPanel] = useState<ToggleStreamTableInLogInterface>({
    streamTable: true,
    diagnosticsLogs: false,
});

return(
    <AppContext.Provider value={
        {
            //from url
            server_port,
            fv_id,
            //view btn
            panelState,
            setPanelState,
            //variables open and close
            showVariable,
            setShowVariable,
            //fv
            fvHeaderState,
            setFvHeaderState,
            //diagnostics run function state
            diagnosticsRunFnNameListState,
            setDiagnosticsRunFnNameListState,
            //diagnostics refresh btn control state
            diagnosticsRefreshState,
            setDiagnosticsRefreshState,
            //diagnostics next step output state
            diagnosticsNextStepsOutputState,
            setDiagnosticsNextStepsOutputState,
            // diagnostics display which content to display
            diagnosticsRunnerDisplayState,
            setDiagnosticsRunnerDisplayState,
            // this records which diagnostics output is display in the log panel
            diagnosticsHistoryState,
            setDiagnosticsHistory,
            // bottom view panel display stream table or diagnostics panel
            viewInLogPanel,
            setViewInLogPanel,
            //variables
            variablesExpandState,
            setVariablesExpandState,
            // expandVariablesHandler,
        }
    }>
        {children}
    </AppContext.Provider>
)
}


/**
* @description this function read app setting from local storage and 
* return the js obj format of app setting
* @returns js object contains app settings
*/
function readFromLocalStorage(){
    const appSettingLocalStorage = localStorage.getItem("appSetting")!;
    const appSettingObj = JSON.parse(appSettingLocalStorage)
    return appSettingObj;
}