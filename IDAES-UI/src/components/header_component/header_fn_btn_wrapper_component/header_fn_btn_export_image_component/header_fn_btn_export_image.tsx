import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export default function HeaderFNBtnExportImage(){
  return(
    <li id="headerExportImageBtn" className={`header_each_btn`}>
        <FontAwesomeIcon icon={faImage} className="mr-sm"/>
        Export
    </li>
  )
}