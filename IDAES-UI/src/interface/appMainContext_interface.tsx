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

export interface ToggleStreamTableInLogInterface {
	streamTable:boolean;
	diagnosticsLogs:boolean;
	[key: string]: boolean;
};

export interface DiagnosticsPanelParamsInterface {
	direction: string;
	diagnosticsPanelLocationInItem: string | undefined;
	diagnosticsPanelLocationInObj: string | undefined;
	diagnosticsPanelStayWith: string | {[keys: string] : any} |undefined;
	splitPercentage: number;
}