import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

export default function HeaderFNBtnSave(){
  
  return(
    <li id="save_btn" className={`header_each_btn`}>
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-sm"/>
        Save
    </li>
  )
}