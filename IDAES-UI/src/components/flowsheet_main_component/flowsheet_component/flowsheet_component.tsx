import { useContext } from "react"
import { AppContext } from "../../../context/appMainContext"

export default function Flowsheet(){
  const context = useContext(AppContext)
  const isShowFlowsheet = context.panelState[0].show;
  return(
    <>
      {
        isShowFlowsheet &&
        <section>
          flowsheet
        </section>
      }
    </>
  )
}