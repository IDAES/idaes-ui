interface EachPanelState {
  panelName : string,
  show : boolean,
  size : {
    maxSize : number,
    defaultSize : number
  }
}

export interface panelStateInterface{
  [key: string]: EachPanelState;
}

export interface fvHeaderStateInterface {
  isShowSteamName : boolean,
  isShowLabels : boolean
}

export interface variablesExpandStateInterface{
  expand : false,
  expandState : any
}