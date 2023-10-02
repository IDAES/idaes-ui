import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function HeaderFNBtnExportImage(){
    return(
        <li id="headerDiagnosticsBtn" className={`header_each_btn`}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-sm"/>
            Diagnostics
        </li>
    )
}