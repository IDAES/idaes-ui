import css from "./header_flowsheet_name.module.css";

export default function HeaderFlowsheetName(){
  return(
    <p className={`asd ${css.header_flowsheet_name}`}>this flowsheet name will depends on user flowsheet or loading...</p>
  )
}