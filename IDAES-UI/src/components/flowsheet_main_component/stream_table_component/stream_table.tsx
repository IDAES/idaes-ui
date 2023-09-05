import StreamTableHeader from "./stream_table_header/stream_table_header";
import "./table.css";

export default function StreamTable(){
  return(
    <>
      <div id="stream-table" className="idaes-container" style={{display : "block"}}>
        <StreamTableHeader />
        <div id="stream-table-container" className="pd-md tableContainer">
          <div id="stream-table-data"  className="ag-theme-alpine"></div>
        </div>
      </div>
    </>
  )
}