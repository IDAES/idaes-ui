import StreamTableHeader from "./StreamTableHeader";
import "./StreamTable.css";

export default function StreamTable(){
  return(
    <>
      <div id="stream-table" className="idaes-container">
        <div id="stream-table-container" className="pd-md tableContainer">
          <div id="stream-table-data"  className="ag-theme-alpine"></div>
        </div>
      </div>
    </>
  )
}