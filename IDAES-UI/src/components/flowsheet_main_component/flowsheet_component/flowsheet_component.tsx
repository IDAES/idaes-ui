import { useContext, useRef } from "react"
import { AppContext } from "../../../context/appMainContext"

declare var joint: any;
declare var paper: any;

export default function Flowsheet(){
  const context = useContext(AppContext)
  const isShowFlowsheet = context.panelState[0].show;

  const canvas:any = useRef(null)

  var namespace = joint.shapes;

        var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: 1500,
            height: 1500,
            gridSize: 1,
            cellViewNamespace: namespace
        });

        var rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Flowsheet',
                fill: 'white'
            }
        });
        rect.addTo(graph);

        var rect2 = rect.clone();
        rect2.translate(300, 0);
        rect2.attr('label/text', 'M01');
        rect2.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(graph);
  
  return(
    <>
      {
        isShowFlowsheet &&
        <section>
          flowsheet
          <div id="myholder"></div>
          <div className="canvas" ref={canvas}></div>
        </section>
      }
    </>
  )
}