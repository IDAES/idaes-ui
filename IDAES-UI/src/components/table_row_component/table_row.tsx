import { useContext, useEffect } from "react";
import {AppContext} from "../../context/appMainContext";

export default function TableRow() {
  const {panelState, model} = useContext(AppContext);
  
  //this read from context and control show or hide table
  const isShowTable = panelState["streamTable"].show
  
  //render to table element
  let isFlowsheetDataLoaded:boolean = false;
  let tableHeader = <th>Loading...</th>;
  let tableContent = <tr><td>Loading...</td></tr>;

  function isModelLoaded(){
    if(
        model && 
        model.stream_table && 
        model.stream_table.columns && 
        model.stream_table.columns.length > 0 &&
        model.stream_table.data //&&
        // model.stream_table.data.length === model.stream_table.columns.length - 1
      ){
        isFlowsheetDataLoaded = true
    }
  }
  var a = 22
  function renderModelToTable(isFlowsheetDataLoaded:boolean){
    if(!isFlowsheetDataLoaded){
      return
    }

    const columns = model.stream_table.columns;
    const data = model.stream_table.data;

    //loading table header
    tableHeader = columns.map((el:string, index:number)=>{
      return (
          <th key={index} className="table_header">{el}</th>
      )
    })

    //loading data to table
    tableContent = data.map((el: any, index:number)=>{
      /**
       * Each data:
       * 0: variable
       * 1: units, { raw, html, latex}
       * 2: store data for each column as their index
       */
      let tableDesk = data[index].map((eachDesk:any, deskIndex:number)=>{
        if(deskIndex <= 1){
          return(
            deskIndex === 0 ?  <td key={deskIndex}>{eachDesk}</td> :  <td key={deskIndex}>{eachDesk.html ? eachDesk.html : "-"}</td>
          )
        }else{
          return(
            <td key={eachDesk[0] + deskIndex}>{eachDesk[0]}</td>
          )
        }
      })
      return(
        <tr key={el + index}>
          {tableDesk}
        </tr>
      )
    })
  }

  isModelLoaded();
  renderModelToTable(isFlowsheetDataLoaded);
  
  return(
    <>
    {
      isShowTable &&
      <>
        <table>
          <tbody>
            <tr>
              {tableHeader}
            </tr>
            {tableContent}
          </tbody>
        </table>
      </>
    }
    </>
  )
}