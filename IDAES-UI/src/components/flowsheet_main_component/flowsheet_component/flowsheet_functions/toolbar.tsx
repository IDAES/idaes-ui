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
 * This class is responsible for all the two toolbars that exist in the page.
 * 
 * The first toolbar is the one that is seen in the page's header. And the
 * second toolbar is seen on the top right corner of the visualizer paper
 * graph.
 */

declare let joint:any;
import {labelStyleLabelOn, labelStyleLabelOff, labelIndex, slinkLabelIndex} from "./data/jjsLabelStyle";

export class Toolbar { 
  _app: any;
  _paper: any;
  _stream_table: any;
  flowsheetId: string;
  getFSUrl: string;
  putFSUrl:string;
  isFvShow:boolean;

  toggleStreamNameBtn:HTMLElement | undefined;
  toggleLabelsBtn:HTMLElement | undefined;

  zoomInBtn:HTMLElement | undefined;
  zoomOutBtn:HTMLElement | undefined;
  zoomToFitBtn: HTMLElement | undefined;

  constructor(app:any, paper:any, stream_table:any | undefined, flowsheetId:string, getFSUrl:string, putFSUrl:string, isFvShow:boolean) {
    //initial arguments
    this._app = app;
    this._paper = paper;
    this._stream_table = stream_table;
    this.flowsheetId = flowsheetId;
    this.getFSUrl = getFSUrl;
    this.putFSUrl = putFSUrl;
    this.isFvShow = isFvShow;
    // this.setupPageToolbar();
    // this.setupFlowsheetToolbar(); 

    //call & register click event to export flowsheet to png function
    //this is a header element its always there
    this.registerEventExportFlowsheetToPng();
    
    //call & register click event to refresh model
    this.registerEventRefresh(this.getFSUrl, this.putFSUrl);

    //call & register click event to save flowsheet
    this.registerEventSave(this.putFSUrl)
    
    //isFvShow repersent stream name, labels, zoom in, zoom out, zoom fit btn
    //if !isFvShow these event has no need to register event
    if(isFvShow){
        /**
         * Tool bar stream names toggle
         */
        //initial toggle stream names btn from selector assign to this
        this.toggleStreamNameBtn = document.querySelector("#stream-names-toggle") as HTMLElement;
        //call function toggleStreamNames register event to toggleStreamNameBtn to toggle stream name show and hide
        //when isFvShow == false the btn is undefined so use &&
        this.toggleStreamNameBtn && this.registerToggleStreamNamesEvent(this.toggleStreamNameBtn);

        /**
         * Tool bar label toggle
         */
        //initial labels btn from selector assign to this
        this.toggleLabelsBtn = document.querySelector("#show-label-toggle") as HTMLElement;
        //call & register click event to export flowsheet to png function
        //when isFvShow == false the btn is undefined so use &&
        this.toggleLabelsBtn && this.registerEventToggleLabel(this.toggleLabelsBtn);
        
        /**
         * Tool bar zoom in out and fit
         */
        //initial zoom btn from selector assign to this
        this.zoomInBtn = document.querySelector("#zoom-in-btn") as HTMLElement;
        this.zoomOutBtn = document.querySelector("#zoom-out-btn") as HTMLElement;
        this.zoomToFitBtn = document.querySelector("#zoom-to-fit") as HTMLElement;
        //call registerZoomEvent function, register 3 zoom events to zoom in zoom out zoom to fit btn on dom
        //when button is not exist it should not register event, one example is isFvShow = false
        if(this.zoomInBtn && this.zoomOutBtn && this.zoomToFitBtn){
            this.registerZoomEvent(this.zoomInBtn, this.zoomOutBtn, this.zoomToFitBtn);
        }
    }
  }

  /**
   * This function register event listener zoom in zoom out and zoom to fit,
   * it takes 3 params.
   * @param zoomInBtn HTML element, selected by ID zoom-in-btn
   * @param zoomOutBtn HTML element, selected by ID zoom-out-btn
   * @param zoomToFitBtn HTML element, selected by ID zoom-to-fit
   */
  registerZoomEvent(zoomInBtn:HTMLElement, zoomOutBtn:HTMLElement, zoomToFitBtn:HTMLElement){
    // Zoom in event listener
    zoomInBtn.addEventListener("click", () => {
        this._paper.paperScroller.zoom(0.2, { max: 4 });
    });

    // Zoom out event listener
    zoomOutBtn.addEventListener("click", () => {
        this._paper.paperScroller.zoom(-0.2, { min: 0.2 });
    });

    // Zoom to fit event listener
    zoomToFitBtn.addEventListener("click", () => {
        this._paper.zoomToFit();
    });
  }

  /**
   * Toggle stream names show and hide.
   * @param toggleStreamNameBtn HTML element, selected by ID stream-names-toggle
   */

  registerToggleStreamNamesEvent(streamNameBtn:HTMLElement){
    streamNameBtn.addEventListener("click", () => {
        //TODO:( bug, boolean order is reversed that is why in if !isShowStreamNames
        const isShowStreamNames = streamNameBtn.getAttribute("data-toggle") === "true" ? true : false;
        if (!isShowStreamNames) {
            this._paper._graph.getLinks().forEach(function (link:any) {
                link.label(slinkLabelIndex, labelStyleLabelOn);
            });
        }
        else {
            this._paper._graph.getLinks().forEach(function (link:any) {
                link.label(slinkLabelIndex, labelStyleLabelOff);
            });
        };
    });
  }

  /**
   * Button event handler register
   * Export flowsheet to to PNG 
   */

  registerEventExportFlowsheetToPng(){
    //this element is static and 100% there.
    const headerExportImageBtn = document.querySelector("#headerExportImageBtn") as HTMLElement;
    headerExportImageBtn.addEventListener("click", () => {
        let p = this._paper.paper;
        const model_id = this.flowsheetId

        // Make sure to hide all of the vertices and bars on the links
        // so they don't show up in the PNG
        p.hideTools();
        p.toPNG(function(png:string) {
            new joint.ui.Lightbox({
                image: png,
                downloadable: true,
                fileName: model_id.concat(".png")
            }).open();
        }, {
            scale:2,
            pixelRatio:2,
            preserveDimensions: true,
            convertImagesToDataUris: true,
            useComputedStyles: true,
            stylesheet: '.scalable * { vector-effect: non-scaling-stroke }'
        });
    });
  }

    /**
     * Toggle label show and hide
     * @param LabelButtonElement the html element use to click to toggel label
     */
    registerEventToggleLabel(showLableBtn:HTMLElement){
        showLableBtn.addEventListener("click", ()=>{
            //read label show or hide from btn data attr
            const isShowLable:string = showLableBtn.getAttribute("data-toggle")!;

            if (isShowLable == "true") {
                this._paper._graph.getLinks().forEach(function (link:any) {
                    link.label(labelIndex, labelStyleLabelOn);
                });
            }
            else{
                this._paper._graph.getLinks().forEach(function (link:any) {
                    link.label(labelIndex, labelStyleLabelOff);
                });
            };
        })
    }

    /**
     * Function register click event to refresh_btn to refresh model
    */
    registerEventRefresh(getUrl:string, putUrl:string){
        // Refresh event listener
        document.querySelector("#refresh_btn")!.addEventListener("click", () => {
            this._app.refreshModel(getUrl, putUrl, this._paper)
        });
    }
    
    /**
     * Function register click event to #save_btn when initial class
     * 
     * @param http_save_url The put url for http server
     */
    registerEventSave(save_url:string){
        document.querySelector("#save_btn")!.addEventListener("click", () => {
            this._app.saveModel(save_url, this._paper.graph);
        });
    }
}
