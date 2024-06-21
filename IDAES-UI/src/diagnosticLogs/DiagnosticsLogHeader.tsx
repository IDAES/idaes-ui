import {useState, useContext, useEffect} from "react";
import { AppContext } from "@/AppContext";
import css from "./DiagnosticsLogHeader.module.css";

import { Button, Classes, Intent, Icon } from '@blueprintjs/core';
import { IconNames, IconName } from '@blueprintjs/icons';

export default function DiagnosticsLogHeader(){
    const {
        diagnosticsHistoryState,
        setDiagnosticsHistory,
        viewInLogPanel,
    } = useContext(AppContext);
    
    /**
     * current history index to hold which history <pre> id anchor 
     * is scroll to and display in log panel, with hash in URL
     * as #diagnostics_log_1 the number is currentHistoryIndex
     * 
     * default is 0 (if diagnosticsHistoryState is undefined or 0)
     * when this component loaded it will read diagnosticsHistoryState which
     * is the how many diagnostics logs we have now, and use it to assign
     * to currentHistoryIndex to display the last log.
     */
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    
    /**
     * History state use to control prev and next btn disabled or not
     * handle in function updatePrevBtnClickable updateNextBtnClickable
     */
    const [hasHistoryState, setHasHistoryState] = useState({
        hasPrevHistory: false,
        hasNextHistory: false
    })

    /**
     * @Description handle prev btn click update current index to 
     * trigger url hash to display correct log in log panel
    */
    function prevHistoryHandler(){
        if(
            currentHistoryIndex > 0
        ){
            setCurrentHistoryIndex((prev)=>{
                let copyState = prev;
                copyState -= 1;
                return copyState
            })
        }

        window.location.hash = `#diagnostics_log_${currentHistoryIndex - 1}`;
    }
    /**
     * @Description handle next btn click update current index to 
     * trigger url hash to display correct log in log panel
    */
    function nextHistoryHandler(){
        if(
            currentHistoryIndex < diagnosticsHistoryState
        ){
            console.log(currentHistoryIndex)
            console.log(diagnosticsHistoryState)
            setCurrentHistoryIndex((prev)=>{
                let copyState = prev;
                copyState += 1;
                return copyState
            })
        }

        window.location.hash = `#diagnostics_log_${currentHistoryIndex}`;
    }

    /**
     * @Description this function use currentHistoryIndex
     * and diagnosticsHistoryState from context to check if the
     * previous and next button should be clickable or not. function use
     * in two useEffect, and for reusability create this function.
     * 
     * @param None
     * @return void
     */
    function updatePrevBtnClickable(){
        // check if has prev log history
        if(currentHistoryIndex - 1 <= 0){
            setHasHistoryState((prev)=>{
                const copyState = {...prev};
                copyState.hasPrevHistory = false;
                return copyState
            });
            return;
        }

        if(currentHistoryIndex - 1 >= 0){
            setHasHistoryState((prev)=>{
                const copyState = {...prev};
                copyState.hasPrevHistory = true;
                return copyState
            });
            return;
        }
    }
    /**
     * @Description this function use currentHistoryIndex
     * and diagnosticsHistoryState from context to check if the
     * previous and next button should be clickable or not. function use
     * in two useEffect, and for reusability create this function.
     * 
     * @param None
     * @return void
     */
    function updateNextBtnClickable(){
        // check if has next log history
        if(currentHistoryIndex == diagnosticsHistoryState){
            setHasHistoryState((prev)=>{
                const copyState = {...prev};
                copyState.hasNextHistory = false;
                return copyState
            })
            return;
        }
        if(currentHistoryIndex < diagnosticsHistoryState){
            setHasHistoryState((prev)=>{
                const copyState = {...prev};
                copyState.hasNextHistory = true;
                return copyState
            })
            return;
        }
    }

    useEffect(()=>{
        window.location.hash = `diagnostics_log_${currentHistoryIndex}`
    },[viewInLogPanel])

    /**
     * effect when diagnostics log total number changes, update the 
     * currentHistoryIndex to match it, which will update url hash
     * which will scroll log panel to the last log
     */
    useEffect(()=>{
        // check and update prev and next btn clickable or not
        updatePrevBtnClickable();
        updateNextBtnClickable();

        setCurrentHistoryIndex(()=>diagnosticsHistoryState);
        window.location.hash = `diagnostics_log_${currentHistoryIndex - 1}`;
    },[diagnosticsHistoryState]);

    /**
     * effect when currentHistoryIndex changes,
     * update url hash to scroll to the log pre tag with id of
     * currentHistoryIndex
     */
    useEffect(()=>{
        // check and update prev and next btn clickable or not
        updatePrevBtnClickable();
        updateNextBtnClickable();

        window.location.hash = `diagnostics_log_${currentHistoryIndex - 1}`;
    },[currentHistoryIndex]);
    

    return(
        <div id="diagnostics_log_panel" className={`${css.diagnostics_log_header_history_btn_container}`}>
            <Button 
                minimal
                disabled={!hasHistoryState.hasPrevHistory}  
                onClick={()=>prevHistoryHandler()}
            >
                <Icon icon={IconNames.UNDO} size={20}></Icon>
            </Button>
            <Button 
                minimal 
                disabled={!hasHistoryState.hasNextHistory} 
                onClick={()=>nextHistoryHandler()}
            >
                <Icon icon={IconNames.REDO} size={20}></Icon>
            </Button>
        </div>
    )
}