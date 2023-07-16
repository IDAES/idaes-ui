import { useContext } from "react";
import {AppContext} from "../../context/appMainContext";

export default function TableRow() {
  const context = useContext(AppContext);
  const isShowTable = context.panelState[2].show
  return(
    <>
    {
      isShowTable && <p>table</p>
      // <>
      //   <tr>
      //     <td>table 1</td>
      //     <td>table 2</td>
      //     <td>table 3</td>
      //   </tr>
      //   <tr>
      //     <td>table 1</td>
      //     <td>table 2</td>
      //     <td>table 3</td>
      //   </tr>
      // </>
    }
    </>
  )
}