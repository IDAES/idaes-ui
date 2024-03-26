import { useContext } from "react";
import { AppContext } from "../../../context/appMainContext";
import css from "./minimized_bar.module.css"

import { PanelStateInterface} from "../../../interface/appMainContext_interface";

export default function MinimizedBar(){
	const {panelState, setPanelState} = useContext(AppContext);
	//this list contain string of panel name which won't render as minimized tag on window
	const blackList = ["fvWrapper"]; 

	// this use to count how may minimized panel, use to assign style padding for minimized_bar_container.
	// only when has minimizedPanelCount > 0 show padding in that container or will have a gap above flowsheet panel.
	let minimizedPanelCount = 0; 
	/**
	 * This function use panelState to render tags base on each panel.show and if this panel name is in blackList.
	 * when a panel is minimized this tag will show, when click on this tag will bring the panel back.
	 * 
	 * @param panelState Object of panelState, from appMainContext
	 * @param blackList Array of string contain panel names, if dont want a panel render as a tag, pass that panel name in this array
	 * @returns array of jsx html element <li class="minimized_bar_li">panelName +</li>
	 */
	function renderMinimizedTags(panelState:any, blackList:Array<string>){
		const panelStateArr: Array<PanelStateInterface> = [];

		Object.keys(panelState).forEach(el=>{
		panelStateArr.push(panelState[el])
		})

		const tags = panelStateArr.map((el:any, index:number)=>{
		if(!blackList.includes(el.panelName) && !el.show){
			minimizedPanelCount++;
			return <li key={el.panelName + index} 
					className={`${css.minimized_bar_li}`}
					onClick={(event: React.MouseEvent<HTMLLIElement>)=>bringPanelback(el.panelName)}
				>
					{el.panelName} +
				</li>
		}
		})

		return tags;
	}
	
	/**
	 * This is a event handle function when minized panel tag clicked the panel with that panel name should be bring back on window
	 * @param panelName String, the panel name to identify which panel should bring back
	 */
	function bringPanelback(panelName:string){
		setPanelState((prevState:any) => {
		const newState = {...prevState}
		Object.keys(newState).forEach((objKey:string)=>{
			if(newState[objKey].panelName === panelName){
			console.log(newState[objKey])
			newState[objKey].show = !newState[objKey].show
			}
		})
		return newState;
		})
	}
	
	//call renderMinimizedTags fn map tags which window is minimized
	const minimizedTags = renderMinimizedTags(panelState, blackList);

	return(
		<div className={`${css.minimized_bar_container} ${minimizedPanelCount > 0 && "pd-sm"}`}>
			<ul className={`${css.minimized_bar_ul}`}>
			{minimizedTags}
			</ul>
		</div>    
	)
}

