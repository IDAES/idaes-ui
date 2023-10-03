import { useContext } from 'react';
import { AppContext } from "../../../../context/appMainContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter, faMinus, faCaretUp} from '@fortawesome/free-solid-svg-icons';

import { VariablesExpandStateInterface } from "../../../../interface/appMainContext_interface";

import css from "./flowsheet_diagnostics_header.module.css";

export default function DiagnosticsHeader(){
    const {panelState, setPanelState} = useContext(AppContext);
    const isFvShow = panelState.fv.show;
    //if flowsheet, read it's height assign to variable.
    let flowsheetHeaderHeight = getFlowSheetHeaderHeight(isFvShow);

    /**
     * @description: Check if flowsheet exist then read its height and assign to a variable to return. this function prevent the diagnostics header is shorter than the flowsheet header.
     * @returns string of flowsheet height with px -> eg. 60px 
     */
    function getFlowSheetHeaderHeight(isFvShow:boolean){
        const flowsheetHeader:HTMLElement | null = document.getElementById("flowsheetHeader");
        let flowsheetHeight = "auto";

        if(flowsheetHeader && isFvShow){
            flowsheetHeight = Math.ceil(flowsheetHeader.clientHeight) + .5 + "px";
            return flowsheetHeight;
        }else{
            return flowsheetHeight;
        }
    }

    /**
     * @description handle btn click full screen diagnostics panel
     */
    function diagnosticsPanelMaxmizeHandler(){
        setPanelState((prev:any)=>{
            const copyState = {...prev};
            Object.keys(copyState).forEach(el=>{
                if(el !== "diagnostics"){
                    copyState[el].show = false;
                }
            })

            return copyState;
        })
    }

    /**
     * @description handle btn click minimize diagnostics panel
     */
    function diagnosticsPanelMinimizeHandler(){
        setPanelState((prev:any)=>{
            const copyState = {...prev};
            Object.keys(copyState).forEach(el=>{
                if(el === "diagnostics"){
                    copyState[el].show = false;
                }
            })

            return copyState;
        })
    }

    return(
        <div className={`pd-md ${css.diagnosticsHeader_main_container}`} style={{height: flowsheetHeaderHeight}}>
            <p className={`${css.diagnostics_title}`}>DIAGNOSTICS</p>
            <div className={css.diagnosticsHeader_icon_container}>
                <span className={`pd-sm ${css.diagnosticsHeader_icon} 
                    ${css.diagnosticsHeader_small_icon}`}
                    onClick={diagnosticsPanelMaxmizeHandler}
                >
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
                </span>
                <span className={`pd-sm ${css.diagnosticsHeader_icon} 
                    ${css.diagnosticsHeader_small_icon}`}
                    onClick={diagnosticsPanelMinimizeHandler}
                >
                <FontAwesomeIcon icon={faMinus} />
                </span>
            </div>
        </div>
    )
}