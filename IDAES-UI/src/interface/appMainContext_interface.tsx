interface EachPanelState {
	panelName : string,
	show : boolean,
	size : {
		maxSize : number,
		defaultSize : number
	}
}

export interface PanelStateInterface{
	[key: string]: EachPanelState;
}

export interface FvHeaderStateInterface {
	isShowSteamName : boolean,
	isShowLabels : boolean
}

export interface VariablesExpandStateInterface{
	expand : false,
	expandState : any
}