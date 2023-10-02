import { useContext } from 'react';
import { AppContext } from "../../../../context/appMainContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter, faMinus, faCaretUp} from '@fortawesome/free-solid-svg-icons';

import { VariablesExpandStateInterface } from "../../../../interface/appMainContext_interface";

import css from "./flowsheet_diagnostics_header.module.css";

export default function DiagnosticsHeader(){
    //if flowsheet, read it's height assign to variable.
    let flowsheetHeaderHeight = getFlowSheetHeaderHeight();

    /**
     * @description: Check if flowsheet exist then read its height and assign to a variable to return. this function prevent the diagnostics header is shorter than the flowsheet header.
     * @returns string of flowsheet height with px -> eg. 60px 
     */
    function getFlowSheetHeaderHeight(){
        const flowsheetHeader:HTMLElement | null = document.getElementById("flowsheetHeader");
        let flowsheetHeight = "auto";

        if(flowsheetHeader){
            flowsheetHeight = flowsheetHeader.clientHeight + "px";
            return flowsheetHeight;
        }else{
            return flowsheetHeight;
        }
    }

    return(
        <div className={`pd-md ${css.diagnosticsHeader_main_container}`} style={{height: flowsheetHeaderHeight}}>
            <p className={`${css.diagnostics_title}`}>DIAGNOSTICS</p>
            <div className={css.diagnosticsHeader_icon_container}>
                <span className={`pd-sm ${css.diagnosticsHeader_icon} ${css.diagnosticsHeader_small_icon}`}>
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
                </span>
                <span className={`pd-sm ${css.diagnosticsHeader_icon} ${css.diagnosticsHeader_small_icon}`}>
                <FontAwesomeIcon icon={faMinus} />
                </span>
            </div>
        </div>
    )
}