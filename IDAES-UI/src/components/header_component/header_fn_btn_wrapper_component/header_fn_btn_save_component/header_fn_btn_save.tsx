export default function HeaderFNBtnSave(){
  function saveHandler(){
    console.log(`saved`)
  }
  
  return(
    <li onClick={saveHandler}>Save</li>
  )
}