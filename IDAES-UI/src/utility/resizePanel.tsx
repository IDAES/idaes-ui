/**
 * @Description This function take current element's id as param then read parent element height and assign to current element
 * @param DOMid DOM element ID
 * @return VOID
 */
export function resizePanelHeightAsParent(DOMid:string){
    const element = document.getElementById(DOMid);
    if(element){
        const parentNodeHeight = element.parentElement?.clientHeight;
        if(parentNodeHeight){
            element.style.height = parentNodeHeight + 'px';
            console.log(parentNodeHeight)
        }else{
            console.log(`Try to resize element as parent height, but parent node high not found!`)
        }
    }else{
        console.log(`Try to resize element as parent height, but parent node element not found!`)
    }
}