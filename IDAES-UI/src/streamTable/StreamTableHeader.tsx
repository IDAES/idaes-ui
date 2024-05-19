import { useContext, useState } from "react";
import { AppContext } from '@/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import css from "./StreamTableHeader.module.css";

export default function StreamTableHeader(){
  const {setPanelState} = useContext(AppContext);
  const [showHideFiel, setShowHideField] = useState(false);
  function toggleHideDropDown(){
    let dropdownUl = document.getElementById("hide-fields-list")!;
    setShowHideField(prev=>!prev);
  }

  return (
    <div className={`${css.stream_table_header_main_container}`}>
      <div className={`${css.stream_table_header_fn_row}`}>
        <div  id="hide-fields-dropdown" 
			className={`nav-link dropdown-toggle idaes-nav-button ${css.hideFieldBtn}`} 
			data-toggle="dropdown" 
			aria-haspopup="true" 
			aria-expanded="false" 
			onClick={toggleHideDropDown}
        >
          	<span>Hide Fields</span>
			<ul id="hide-fields-list" 
				className={`dropdown-menu checkbox-menu ${css.dropdownMenu}`}
				style={{display : showHideFiel ? "block" : "none"}}
			>
              {/* table cell is generate base on model */}
            </ul>
		</div>
		{/* <span 
			id="minimize-flowsheet-panel-btn"
			className={`pd-sm ${css.flowsheet_header_icon_container} 
			${css.flowsheetHeader_small_icon}`}
			onClick={()=>minimizePanel('streamTable', setPanelState)}
		>
            <FontAwesomeIcon icon={faMinus} />
		</span> */}
	</div>
      
      {/* table cell is generate base on model */}
      <div id="existing-variable-types" className={`streamtable-vartype-panel ${css.streamtable_vartype_panel}`}></div>
    </div>
  )
}