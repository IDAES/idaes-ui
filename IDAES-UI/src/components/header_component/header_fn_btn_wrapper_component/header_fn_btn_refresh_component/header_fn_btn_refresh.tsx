export default function HeaderFNBtnRefresh(){
  function refreshHandler(){
    console.log(`refreshed header_fn_btn_refresh`)
  }
  
  return(
    <li onClick={refreshHandler}>Refresh</li>
  )
}