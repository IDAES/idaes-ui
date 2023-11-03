import { useContext } from 'react';
import { AppContext } from "../../../../context/appMainContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter, faMinus, faCaretUp} from '@fortawesome/free-solid-svg-icons';

import { VariablesExpandStateInterface } from "../../../../interface/appMainContext_interface";

import css from "./flowsheet_variables_header.module.css";

export default function FlowsheetVariablesHeader(){
  const { variablesExpandState } = useContext(AppContext);
  const { setVariablesExpandState } = useContext(AppContext);

  function expandVariablesHandler(){
    //when Click to toggle variable expand or collapse
    //click btn is in variable header
    setVariablesExpandState((prev:VariablesExpandStateInterface)=>{
      let copyPrev = {...prev, expand : !prev.expand};
      return copyPrev;
    })
  }

  return(
    <div className={`pd-md ${css.flowsheetVariablesHeader_main_container}`}>
      <p className={`${css.flowsheetVariables_title}`}>VARIABLES</p>
      <div className={css.flowsheetVariablesHeader_icon_container}>
        <span className={`${css.flowsheetVariablesHeader_icon} ${css.flowsheetVariableHeader_collapse_btn}`}
              onClick={expandVariablesHandler}
        >
          <FontAwesomeIcon icon={faCaretUp} rotation={variablesExpandState.expand ? 180 : 90} />
          {variablesExpandState.expand ? "Collapse" : "Expand"}
        </span>
        <span className={`pd-sm ${css.flowsheetVariablesHeader_icon} ${css.flowsheetVariablesHeader_small_icon}`}>
          <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
        </span>
        <span className={`pd-sm ${css.flowsheetVariablesHeader_icon} ${css.flowsheetVariablesHeader_small_icon}`}>
          <FontAwesomeIcon icon={faMinus} />
        </span>
      </div>
    </div>
  )
}