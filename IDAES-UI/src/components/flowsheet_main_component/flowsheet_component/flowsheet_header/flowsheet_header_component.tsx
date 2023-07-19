import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus,faExpand, faUpRightAndDownLeftFromCenter, faMinus } from '@fortawesome/free-solid-svg-icons'
import css from "./flowsheet_header.module.css";

export default function FlowsheetHeader(){
  return(
    <div className={`pd-md ${css.flowsheetHeader_main_container}`}>
      <p className={css.flowsheetHeader_title}>FLOWSHEET</p>
      <div className={css.flowsheetHeader_icon_container}>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><input type="checkbox"/> Steam Names</span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><input type="checkbox"/> Labels</span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><FontAwesomeIcon icon={faMagnifyingGlassPlus} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon}`}><FontAwesomeIcon icon={faMagnifyingGlassMinus} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheet_header_last_box_icon}`}><FontAwesomeIcon icon={faExpand} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheet_header_small_icon}`}><FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} /></span>
        <span className={`pd-sm ${css.flowsheet_header_icon} ${css.flowsheet_header_small_icon}`}><FontAwesomeIcon icon={faMinus} /></span>
      </div>
    </div>
  )
}