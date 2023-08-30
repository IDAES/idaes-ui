import { useContext } from 'react';
import { AppContext } from '../../../../context/appMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus,faExpand, faUpRightAndDownLeftFromCenter, faMinus, faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons'

import {fvHeaderStateInterface} from "../../../../interface/appMainContext_interface";

import css from "./flowsheet_header.module.css";

export default function FlowsheetHeader(){
  const { fvHeaderState, setFvHeaderState } = useContext(AppContext);
  const isShowSteamName = fvHeaderState.isShowSteamName;
  const isShowLabels = fvHeaderState.isShowLabels;

  //toggle show steam names
  function showSteamNameHandler(){
    setFvHeaderState((prev:fvHeaderStateInterface)=>{
      let copyPrev = {...prev, isShowSteamName : !prev.isShowSteamName};
      return copyPrev;
    })
  }

  //toggle show labels
  function showLabelsHandler(){
    setFvHeaderState((prev:fvHeaderStateInterface)=>{
      let copyPrev = {...prev, isShowLabels : !prev.isShowLabels};
      return copyPrev;
    })
  }

  return(
    <div className={`pd-md ${css.flowsheetHeader_main_container}`}>
      <p className={css.flowsheetHeader_title}>FLOWSHEET</p>
      <div className={css.flowsheetHeader_icon_container}>
        <span id="stream-names-toggle"
              className={`pd-sm ${css.flowsheet_header_icon_container}`}
              onClick={showSteamNameHandler}
              data-toggle={`${isShowSteamName}`}
        >
          {
            isShowSteamName
            ?
            <FontAwesomeIcon icon={faSquareCheck} className={css.flowsheetHader_icon_stroke_only} />
            :
            <FontAwesomeIcon icon={faSquare} className={css.flowsheetHader_icon_stroke_only}/>
          }
          <span className={`${css.flowsheetHeader_btn_with_icon_text}`}>Stream Names</span>
        </span>
        <span className={`pd-sm ${css.flowsheet_header_icon_container}`}
              onClick={showLabelsHandler}
        >
          {
            isShowLabels 
            ?
              <FontAwesomeIcon icon={faSquareCheck} className={css.flowsheetHader_icon_stroke_only}/>
            :
              <FontAwesomeIcon icon={faSquare} className={css.flowsheetHader_icon_stroke_only}/>
          }
          <span className={`${css.flowsheetHeader_btn_with_icon_text}`} data-toggle={isShowLabels}>Labels</span>
        </span>
        <span id="zoom-in-btn" className={`pd-sm ${css.flowsheet_header_icon_container}`}>
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} className={css.flowsheetHader_icon_stroke_only}/>
        </span>
        <span id="zoom-out-btn" className={`pd-sm ${css.flowsheet_header_icon_container}`}>
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} className={css.flowsheetHader_icon_stroke_only}/>
        </span>
        <span id="zoom-to-fit" className={`pd-sm ${css.flowsheet_header_icon_container} ${css.flowsheetHeader_last_box_icon}`}>
          <FontAwesomeIcon icon={faExpand} />
        </span>
        <span className={`pd-sm ${css.flowsheet_header_icon_container} ${css.flowsheetHeader_small_icon}`}>
          <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
        </span>
        <span className={`pd-sm ${css.flowsheet_header_icon_container} ${css.flowsheetHeader_small_icon}`}>
          <FontAwesomeIcon icon={faMinus} />
        </span>
      </div>
    </div>
  )
}