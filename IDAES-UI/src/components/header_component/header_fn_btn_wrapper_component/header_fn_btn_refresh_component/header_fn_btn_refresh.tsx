import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
export default function HeaderFNBtnRefresh(){
  function refreshHandler(){
    console.log(`refreshed header_fn_btn_refresh`)
  }
  
  return(
    <li className={`header_each_btn`} onClick={refreshHandler}>
      <FontAwesomeIcon icon={faArrowsRotate} className="mr-sm"/>
      Refresh
    </li>
  )
}