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
        rect.position(400, 250);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'none'
            },
            label: {
                text: 'inlet_1_1',
                fill: 'black'
            }
        });
        rect.addTo(graph);
        
        //ract 1
        var rect1 = rect.clone();
        rect1.translate(0, 200);
        rect1.attr('label/text', 'inlet_2_1');
        rect1.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.addTo(graph);

        //ract 2
        var rect2 = rect.clone();
        rect2.translate(250, 100);
        rect2.attr('label/text', 'M01');
        rect2.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect1);
        link.target(rect2);
        link.addTo(graph);

        //ract 3
        var rect3 = rect.clone();
        rect3.translate(500, 100);
        rect3.attr('label/text', 'H02');
        rect3.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect2);
        link.target(rect3);
        link.addTo(graph);

        //ract 4
        var rect4 = rect.clone();
        rect4.translate(750, 100);
        rect4.attr('label/text', 'F03');
        rect4.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect3);
        link.target(rect4);
        link.addTo(graph);

        //ract 5
        var rect5 = rect.clone();
        rect5.translate(1000, 0);
        rect5.attr('label/text', 'vap_outlet_1');
        rect5.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect4);
        link.target(rect5);
        link.addTo(graph);

        //ract 6
        var rect6 = rect.clone();
        rect6.translate(1000, 200);
        rect6.attr('label/text', 'liq_outlet_2');
        rect6.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect4);
        link.target(rect6);
        link.addTo(graph);
  
  return(
    <>
      {
        isShowFlowsheet &&
        <section className="pd-md">
          flowsheet
          <div id="myholder"></div>
          <div className="canvas" ref={canvas}></div>
        </section>
      }
    </>
  )
}