import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
export default function HeaderFNBtnRefresh(){
  return(
    <li id="refresh_btn" className={`header_each_btn`}>
      <FontAwesomeIcon icon={faArrowsRotate} className="mr-sm"/>
      Refresh
    </li>
  )
}