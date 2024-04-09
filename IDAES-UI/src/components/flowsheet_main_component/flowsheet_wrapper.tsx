import { useContext, useEffect } from "react";
import {AppContext} from "../../context/appMainContext";
import { MainFV } from "./flowsheet_component/flowsheet_functions/mainFV";
import MosaicApp from "../mosaic/mosic";
import MinimizedBar from "./minimized_bar_component/minimized_bar_component";

import css from "./flowsheet_wrapper.module.css";

export default function FlowsheetWrapper(){

	let {server_port, fv_id, panelState, viewInLogPanel} = useContext(AppContext);
	const isFvShow:boolean = panelState.fv.show;
	const isDiagnosticsShow:boolean = panelState.diagnostics.show;
	const isStreamTableShow = panelState.streamTable.show;

	const panelShow = {display:"block"};
	const panelHide = {display:"none"};

  useEffect(()=>{
	let fv:any;
	if(!fv){
		//get server port base on UI port number, vite running on 5173 on dev
		server_port == "5173" ? server_port = 8000 : server_port = server_port;
		//when template loaded then render flowsheet, variable, stream table to page with minFV class.
		fv = new MainFV(fv_id, server_port, isFvShow, false, isStreamTableShow, viewInLogPanel); //The false is placeholder for isVariableShow, now variable panel is not show
	}else{
		fv = undefined;
	}
    
    return ()=>{
		// clean up event handler
        if (fv && typeof fv.cleanToolBarEvent === 'function') {
            fv.cleanToolBarEvent();
        }
    }
  },[isFvShow, isStreamTableShow, isDiagnosticsShow, viewInLogPanel]);

	return(
		<div id="flowsheet-wrapper" className={css.flowsheetWrapper}>
			{/**
			 * 	The MosaicApp is return mosaic dragable panels
			 * 	it contains the wrapper mosaic window which is render:
			 * 	components, flowsheet, diagnostics, stream table
			 */}
			<MosaicApp />
		</div>
	)
}