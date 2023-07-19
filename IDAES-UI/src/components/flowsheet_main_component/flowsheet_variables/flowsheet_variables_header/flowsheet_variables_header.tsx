import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter, faMinus, faCaretUp } from '@fortawesome/free-solid-svg-icons';

import css from "./flowsheet_variables_header.module.css";

export default function FlowsheetVariablesHeader(){
  return(
    <div className={`pd-md ${css.flowsheetVariablesHeader_main_container}`}>
      <p className={`${css.flowsheetVariables_title}`}>VARIABLES</p>
      <div className={css.flowsheetVariablesHeader_icon_container}>
        <span className={`${css.flowsheetVariablesHeader_icon} ${css.flowsheetVariableHeader_collapse_btn}`}>
          <FontAwesomeIcon icon={faCaretUp} rotation={180} />
          Collapse
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