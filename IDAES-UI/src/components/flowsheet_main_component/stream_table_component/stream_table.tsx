import Table_row from "../../table_row_component/table_row"; //this import is for holder only delete later, the structure is changed

import "./table.css";

export default function StreamTable(){
  return(
    <>
      {/*this is only a holder*/}
      {/* <Table_row /> */}

      {/*below is not show because the display is setting none*/}
      <div id="stream-table" className="idaes-container" style={{display : "block"}}>
        <div id="existing-variable-types" className="streamtable-vartype-panel"></div>

        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="collapse navbar-collapse p-0" id="navbar-stream-table">
            <ul className="nav navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle idaes-nav-button" id="hide-fields-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                  Hide Fields
                </a>
                <ul id="hide-fields-list" className="dropdown-menu checkbox-menu">
                </ul>
              </li>
            </ul>
          </div>
        </nav>
        
        <div id="stream-table-container">
          <div id="stream-table-data"  className="ag-theme-alpine"></div>
        </div>
      </div>
    </>
  )
}