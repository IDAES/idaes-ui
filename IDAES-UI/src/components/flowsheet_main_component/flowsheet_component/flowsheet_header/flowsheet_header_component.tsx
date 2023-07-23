import { useContext } from 'react';
import { AppContext } from '../../../../context/appMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus,faExpand, faUpRightAndDownLeftFromCenter, faMinus, faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons'

import css from "./flowsheet_header.module.css";

export default function FlowsheetHeader(){
  const { fvHeaderState } = useContext(AppContext);
  const isShowSteamName = fvHeaderState.isShowSteamName;
  const isShowLabels = fvHeaderState.isShowLabels;
  const {showSteamNameHandler} = useContext(AppContext);
  const {showLabelsHandler} = useContext(AppContext);

  return(
    <div className={`pd-md ${css.flowsheetHeader_main_container}`}>
      <p className={css.flowsheetHeader_title}>FLOWSHEET</p>
      <div className={css.flowsheetHeader_icon_container}>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}
              onClick={showSteamNameHandler}
        >
          {
            isShowSteamName
            ?
            <FontAwesomeIcon icon={faSquareCheck} />
            :
            <FontAwesomeIcon icon={faSquare} />
          }
          <span className={`${css.flowsheetHeader_btn_with_icon_text}`}>Steam Names</span>
        </span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}
              onClick={showLabelsHandler}
        >
          {
            isShowLabels 
            ?
              <FontAwesomeIcon icon={faSquareCheck} />
            :
              <FontAwesomeIcon icon={faSquare} />
          }
          <span className={`${css.flowsheetHeader_btn_with_icon_text}`}>Labels</span>
        </span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><FontAwesomeIcon icon={faMagnifyingGlassPlus} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><FontAwesomeIcon icon={faMagnifyingGlassMinus} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheetHeader_last_box_icon}`}><FontAwesomeIcon icon={faExpand} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheetHeader_small_icon}`}><FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheetHeader_small_icon}`}><FontAwesomeIcon icon={faMinus} /></span>
      </div>
    </div>
  )
}