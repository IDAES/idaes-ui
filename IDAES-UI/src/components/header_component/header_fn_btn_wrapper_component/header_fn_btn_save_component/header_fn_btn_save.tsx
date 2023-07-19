import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

export default function HeaderFNBtnSave(){
  function saveHandler(){
    console.log(`saved`)
  }
  
  return(
    <li onClick={saveHandler}>
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-sm"/>
        Save
    </li>
  )
}