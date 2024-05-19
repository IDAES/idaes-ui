/**
 * The Institute for the Design of Advanced Energy Systems Integrated Platform
 * Framework (IDAES IP) was produced under the DOE Institute for the
 * Design of Advanced Energy Systems (IDAES), and is copyright (c) 2018-2021
 * by the software owners: The Regents of the University of California, through
 * Lawrence Berkeley National Laboratory,  National Technology & Engineering
 * Solutions of Sandia, LLC, Carnegie Mellon University, West Virginia University
 * Research Corporation, et al.  All rights reserved.
 *
 * Please see the files COPYRIGHT.md and LICENSE.md for full copyright and
 * license information.
 */


/**
 * This is the main class for the visualizer paper that displays jointjs
 * elements. The graph and its events and event handlers are built in this
 * class.
 */
import {labelStyleLabelOn, labelStyleLabelOff, labelIndex, slinkLabelIndex} from "./data/jjsLabelStyle";
declare let joint: any;
declare let self: any;

export class Paper {
    _app:any;
    joint:any;
    _originalLinkStroke:String;
    _originalLinkStrokeWidth:Number;
    _highlightLinkStroke:String;
    _highlightLinkStrokeWidth:Number;

    _graph: any;
    _paper:any;
    _paperScroller:any;
    _selection:any;

    constructor(app:any) {
        this._app = app;
        let standard = joint.shapes.standard;
        let width = 800;
        let height = 800;
        let gridSize = 1;

        // Default values for the highlighting events
        this._originalLinkStroke = "#979797";
        this._originalLinkStrokeWidth = 2;
        this._highlightLinkStroke = "#0B79BD";
        this._highlightLinkStrokeWidth = 4;

        // jointjs objects
        this._graph = new joint.dia.Graph([], { cellNamespace: { standard } });
        this._paper = new joint.dia.Paper({
            model: this._graph,
            cellViewNamespace: { standard },
            width: width,
            height: height,
            gridSize: gridSize,
            drawGrid: false,
            interactive: true
        });

        this._paperScroller = new joint.ui.PaperScroller({
            padding: 100,
            paper: this._paper,
            autoResizePaper: true,
            scrollWhileDragging: true,
            baseWidth: 10,
            baseHeight: 10,
            cursor: 'grab'
        });

        this._selection = new joint.ui.Selection({
            paper: this._paper
        });
        this._selection.removeHandle('remove');
        this._selection.removeHandle('rotate');
        this._selection.removeHandle('resize');

        // We need to save this to a variable so that we can access it later
        self = this;

        // The container of the paperscroller needs to be a fixed size or the paperScroller
        // will explode in the y direction when you drag an unit model off of the paper
        // We want all of the elements to be the same width so set the width equal to the 
        // stream table
            //let stream_table = document.getElementById("stream-table");
            //$('#idaes-canvas').css({ height: stream_table.offsetHeight });
            //$("#idaes-canvas")[0].append(self._paperScroller.render().el);
            let fvCanvas : HTMLElement | null = document.getElementById("fv");
            fvCanvas!.append(self._paperScroller.render().el);

        self.preSetupRegisterEvents();
    }

    get graph() {
        return this._graph
    }

    set graph(data) {
        this._graph.fromJSON(data);
    }

    get paper() {
        return self._paper
    }

    get paperScroller() {
        return self._paperScroller
    }

    get selection() {
        return self._selection
    }

    translate_for_angle(angle:number, /*width:any, height:any*/) {
        // TODO: replace with geometry that considers width and height
        const angle_translation:{ [key: number] : number[] } = {
            0: [0, 5], 
            90: [38, -35], 
            180: [0, -72], 
            270: [-38, -34]
        };
        return angle_translation[angle];
    }

    /**
     * Register Events before the graph model is loaded
     */
    preSetupRegisterEvents() {
        // Save model every time the graph changes
        this._graph.on('change:position change:angle change:vertices', () => {
            this._app.graphChanged();
        });


        // Getting the main elements for the idaes canvas and the stream table
        // to be able to dispatch highlighting events to the streams existing
        // on paper and in the stream table
        let idaesCanvas:HTMLElement = document.getElementById('fv')!;
        if(!idaesCanvas){
            console.error(`idaes canvas is not found`);
        }

        
        // Setup paper resize on window resize
        const streamTable = document.querySelector('#stream-table-data');
        // window.onresize = function() {
        //     let stream_table = document.getElementById("stream-table");
        //     idaesCanvas.style.height = stream_table.offsetHeight + "";
        // }

        // Registering listeners to idaes-canvas to highlight the correct
        // streams in the paper
        idaesCanvas.addEventListener('HighlightStream', (event:any) => {
            const relatedLinkElement = idaesCanvas.querySelector(
                `[model-id=${event.detail.streamId}]`
            );
            if (relatedLinkElement) {
                relatedLinkElement.dispatchEvent(new Event('HighlightStream')); //this is not working now the stream table is not highlight when hover fv link
            }
        });
        
        // Registering listeners to idaes-canvas to remove the highlight from
        // the correct streams in the paper
        idaesCanvas.addEventListener('RemoveHighlightStream', (event:any) => {
            const relatedLinkElement = idaesCanvas!.querySelector(
                `[model-id=${event.detail.streamId}]`
            );

            if (relatedLinkElement) {
                relatedLinkElement.dispatchEvent(new Event('RemoveHighlightStream'));
            }
        });

        // Initiate selecting when the user grabs the blank area of the paper.
        self._paper.on('blank:pointerdown', self._selection.startSelecting);

        // Select an element if CTRL/Meta key is pressed while the element is clicked.
        self._paper.on('element:pointerup', function(cellView:any, evt:any) {
                console.log(`work`)
            if (evt.shiftKey || evt.metaKey) {
                self._selection.collection.add(cellView.model);
            }
        });

        // Unselect an element if the Shift/Meta key is pressed while a selected element is clicked.
        self._selection.on('selection-box:pointerdown', function(elementView:any, evt:any) {
            if (evt.shiftKey || evt.metaKey) {
                self._selection.collection.remove(elementView.model);
            }
        });

        // /images/icons rotate 90 degrees on right click. Replaces browser 
        // context menu
        self._paper.on("element:contextmenu", function(cellView:any, evt:any) {
            cellView.model.rotate(90)
            // This is needed to keep the text labels for the unit models in the correct orientation
            // x and y were specifically picked to keep the label in the same place 
            // in relation to the unit model (bottom middle)
            // TODO Make this figuring out the x and y positions a function so that we can compute it
            const angle = cellView.model.angle()
            const angle_translation = self.translate_for_angle(angle, 0, 0);
            if (angle_translation === undefined) {
                console.error(`Angle of unit model must be either 0, 90, 180, or 270. Angle is ${angle}`);
            }
            else {
                cellView.model.attr("label/transform", `translate(${angle_translation[0]}, ${angle_translation[1]}) rotate(-${angle})`);
            }
        });

        // Setup event when a link in the paper is hovered upon
        self._paper.on("link:mouseenter", function(linkView:any) {
            // Adds link tools (adding vertices, moving segments) to links when your
            // mouse over
            //1. check if streamTable and idaesCanvas are exist if not should not assign event to them
            let streamTable = document.querySelector('#stream-table-data');
            let idaesCanvas = document.querySelector('#fv');
            if(!streamTable || !idaesCanvas) return;
            
            let verticesTool = new joint.linkTools.Vertices({
                focusOpacity: 0.5,
                redundancyRemoval: true,
                snapRadius: 20,
                vertexAdding: true,
            });
            let segmentsTool = new joint.linkTools.Segments();

            let toolsView = new joint.dia.ToolsView({
                tools: [
                    verticesTool, segmentsTool
                ]
            });
            linkView.addTools(toolsView);
            linkView.showTools();

            // Highlight the corresponding Link and the column in the Stream Table
            const highlightStreamEvent = new CustomEvent(
                'HighlightStream',
                {
                    detail: {
                        streamId: linkView.model.id
                    }
                }
            );
            idaesCanvas!.dispatchEvent(highlightStreamEvent);
                streamTable!.dispatchEvent(highlightStreamEvent);
        });

        // Setup event when the hovering over link ends
        self._paper.on("link:mouseleave", function(linkView:any) {
            // Removes the link tools when you leave the link
            linkView.hideTools();

            // Remove the highlight from the link and the column in the
            // Stream Table when the hovering ends
            const removeHighlightStreamEvent = new CustomEvent(
                'RemoveHighlightStream',
                {
                    detail: {
                        streamId: linkView.model.id
                    }
                }
            );

            if(idaesCanvas) idaesCanvas!.dispatchEvent(removeHighlightStreamEvent);
            if(streamTable) streamTable!.dispatchEvent(removeHighlightStreamEvent);
            
        });

        // Link labels will appear and disappear on right click. Replaces browser context menu
        self._paper.on("link:contextmenu", function(linkView:any, evt:any) {
            if (linkView.model.label(labelIndex)["attrs"]["text"]["display"] === 'none') {
                linkView.model.label(labelIndex, labelStyleLabelOn);
            }
            else {
                linkView.model.label(0, labelStyleLabelOff);
            }
        });
    }

    /**
     * Adjust the paper content to the center
     */
    zoomToFit(padding = 30) {
        this._paperScroller.zoomToFit({padding: padding})
    }

    /**
     * Register Events after the graph model is loaded
     */
    postSetupRegisterEvents() {
        // Recenter the paper
        this.zoomToFit();

        // Setup event listeners for the links in Paper/Graph
        this._graph.getLinks().forEach((link:any) => {
            let linkView = link.findView(this._paper);
            linkView.el.addEventListener('HighlightStream', () => {
                linkView.model.attr({
                    line: {
                        stroke: this._highlightLinkStroke,
                        'stroke-width': this._highlightLinkStrokeWidth
                    }
                });
            });

            linkView.el.addEventListener('RemoveHighlightStream', () => {
                linkView.model.attr({
                    line: {
                        stroke: this._originalLinkStroke,
                        'stroke-width': this._originalLinkStrokeWidth
                    }
                });
            });
        });
    }

    /**
     * This will reorder the units, the vap outlet should stay above liq outlet
     * @param model the processed_model from mainFV renderModel
     */
    reorderLabel(model:any){
        let liqIndex:number | null = null;
        let vapIndex:number | null = null;

        model.cells.forEach((el:any, index:number)=>{
            if(el.id.includes("liq")) liqIndex = index
            if(el.id.includes("vap")) vapIndex = index
        });
        
        if(!liqIndex || !vapIndex) return;
        
        const holder = model.cells[liqIndex];
        model.cells[liqIndex] = model.cells[vapIndex];
        model.cells[vapIndex] = holder;
        
        model.cells[liqIndex]
        return
    }

    /**
     * render customized label on screen base on the position of jjs label.
     * 
     * keep for reference
     * 
     * This label here is stand alone from joint js, better style,
     * but not lack on zoom in and zoom out functions
     * 
     * @param model
     */
    // renderLabelOnScreen(model:any){
    //     //get label id and data store into variable cellsHasLabels
    //     let cellsHasLabels : Array<any> = [];
    //     model.cells.forEach((el:any, index:number)=>{
    //         if(el.labels){
    //             let labelData = {
    //                 id : el.id,
    //                 text : el.labels[0].attrs.text.text
    //             }

    //             cellsHasLabels.push(labelData);
    //         }
    //     })

    //     const fv = document.querySelector("#fv");

    //     cellsHasLabels.forEach((eachLabelData:any, index:number)=>{
    //         //initial element
    //         let customizeLabel = document.createElement("div");
    //         //set element attr
    //         customizeLabel.className = "linkLabel";
    //         customizeLabel.setAttribute("data-linkId", eachLabelData.id);
    //         customizeLabel.setAttribute("draggable", "true");
    //         //append text
    //         customizeLabel.innerText = eachLabelData.text;
    //         //append to dom
    //         //css in index.css
            
    //         // assign position to each label
    //         let jjsLinkTag = document.querySelectorAll('.label text tspan');
    //         let fvX = fv.getBoundingClientRect().left;
    //         let fvY = fv.getBoundingClientRect().top;
            
    //         jjsLinkTag.forEach((linkTextElement:any)=>{
    //             if(linkTextElement.textContent === eachLabelData.id){
    //                 let x = linkTextElement.getBoundingClientRect().left - fvX;
    //                 let y = linkTextElement.getBoundingClientRect().top - fvY;
                    
    //                 customizeLabel.style.left = x + "px";
    //                 customizeLabel.style.top = y + "px";
    //             }
    //         });

    //         // fv?.appendChild(customizeLabel);
    //         // this.moveCustomizedLable()
    //     })
    // }

    // moveCustomizedLable(){
    //     const customizedLabel = document.querySelectorAll(".linkLabel");

    //     let startX:number, startY:number;
    //     let labelX:number, labelY:number;

    //     customizedLabel.forEach((label:any)=>{
    //         let fvX = fv.getBoundingClientRect().left;
    //         let fvY = fv.getBoundingClientRect().top;

    //         label.addEventListener('mousedown', (event:MouseEvent)=>{
    //             console.log(`drag`)
    //             startX = event.clientX - fvX;
    //             startY = event.clientY - fvY;

    //             const rect = label.getBoundingClientRect();

    //             const offsetX = startX - rect.left;
    //             const offsetY = startY - rect.top;

    //             labelX = rect.left - fvX;
    //             labelY = rect.top - fvY;

                
    //         })

    //         label.addEventListener('dragstart', (event:DragEvent)=>{
    //             // var img = new Image();
    //             // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    //             // event.dataTransfer!.setDragImage(img, 0, 0);
    //         })

    //         label.addEventListener('drag', (event:DragEvent)=>{
    //             let currentClientX = event.clientX;
    //             let currentClientY = event.clientY;

    //             let movedX = currentClientX - startX - fvX;
    //             let movedY = currentClientY - startY - fvY;

    //             console.log(labelX + movedX)
    //             console.log(labelY + movedY)
    //             label.style.left = labelX + movedX + "px";
    //             label.style.top = labelY + movedY + "px";

    //         })

    //         // label.addEventListener('dragend', (event:MouseEvent)=>{
    //         //     console.log(`done`)
    //         //     let currentClientX = event.clientX;
    //         //     let currentClientY = event.clientY;

    //         //     let movedX = currentClientX - startX - fvX;
    //         //     let movedY = currentClientY - startY - fvY;

    //         //     label.style.left = labelX + movedX + "px";
    //         //     label.style.top = labelY + movedY + "px";
    //         //     label.style.display = "block";
    //         // })
    //     })
    // }

    // moveCustomizedLable(){
    //     const customizedLabel = document.querySelectorAll(".linkLabel");
    
    //     let startX:number, startY:number;
    //     let labelX:number, labelY:number;
    
    //     customizedLabel.forEach((label:any)=>{
    //         label.addEventListener('dragstart', (event:DragEvent)=>{
    //             console.log(`drag`)
    //             startX = event.clientX;
    //             startY = event.clientY;
    
    //             labelX = label.getBoundingClientRect().left;
    //             labelY = label.getBoundingClientRect().top;
    
    //             // event.dataTransfer.setDragImage(new Image(), 0, 0);
    //         })
    
    //         label.addEventListener('drag', (event:DragEvent)=>{
    //             label.style.display = "none";
    //         })
    
    //         label.addEventListener('dragend', (event:DragEvent)=>{
    //             let currentClientX = event.clientX;
    //             let currentClientY = event.clientY;
    
    //             let movedX = currentClientX - startX;
    //             let movedY = currentClientY - startY;
    
    //             console.log(movedX, movedY)
    
    //             label.style.left = labelX + movedX + "px";
    //             label.style.top = labelY + movedY + "px";
    //             label.style.display = "block";
    //         })
    //     })
    // }

    /**
     * Setup the graph model. The jointjs graph loads the model as Json object
     * and then this setup() function registers the post setup events.
     * 
     * @param model the flowsheet model
     */
    setup(model:any) {
        const iconDir = "/assets/image/flowsheet_icons/";
        model.cells.reverse()
        model.cells.forEach((el: any) => {
            if (el.type === "standard.Image") {
                let imageURL = iconDir + el.attrs.image.xlinkHref.match(/([^\/]+\.svg)$/)[0];
                el.attrs.image = { ...el.attrs.image, xlinkHref: imageURL };
            }

            if(el.labels){
                // el.labels.reverse()
                el.z = 1000
                el.labels[0]
            }
        });

        //if vap out goes to top liq goes to bottom
        this.reorderLabel(model);
        this._graph.fromJSON(model);
        this.postSetupRegisterEvents();
    }
};
