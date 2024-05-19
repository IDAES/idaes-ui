import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchange } from "@fortawesome/free-solid-svg-icons";

export default function HeaderFNBtnLayoutReset(){
    function resetPanelLayoutHandler(){
        const layoutRelatedItems:Array<string> = ["mosaicLayout", "layout", "diagnosticsPanelParams"];
        layoutRelatedItems.forEach(el=>{
            localStorage.removeItem(el);
        })
        window.location.reload();
    }
    
    return(
        <li id="save_btn" className={`header_each_btn`} onClick={()=>{resetPanelLayoutHandler()}}>
            <FontAwesomeIcon icon={faExchange} className="mr-sm"/>
            Reset Layout
        </li>
    )
}