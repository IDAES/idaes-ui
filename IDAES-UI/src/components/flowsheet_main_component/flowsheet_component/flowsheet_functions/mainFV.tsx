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

import { Paper } from './paper';
import { JointJsCellConfig } from './cell_config';
import { StreamTable } from './stream_table';
import { Toolbar } from './toolbar';
import axios from 'axios';
const VITE_MODE = import.meta.env.VITE_MODE;

const isDevTest:Boolean = false;

/**
 * The main client app responsible for IDAES related visualizations. Here in
 * the main file, we:
 *     1. Render the model.
 *     2. Display the stream table.
 */
export class MainFV {
  flowsheetId:string;
  //define type for this class for TS
  isFvShow:boolean;
  // isVariablesShow:boolean;
  isStreamTableShow:boolean;
  baseUrl:string;
  getFSUrl:string;
  putFSUrl:string;
  model:any;
  paper:any;
  _is_graph_changed:boolean;
  _save_time_interval_key:string;
  _default_save_time_interval:number;
  _save_time_interval:any;
  stream_table:any;
  toolbar: any;


  constructor (flowsheetId:any, port:string | number, isFvShow:boolean, isVariablesShow:boolean, isStreamTableShow:boolean) {
    this.flowsheetId = flowsheetId;
    //which panel is show
    this.isFvShow = isFvShow;
    // this.isVariablesShow = isVariablesShow;
    this.isStreamTableShow = isStreamTableShow;

    //Gerneate url for fetch data
    this.baseUrl = `http://localhost:${port}`
    this.getFSUrl = VITE_MODE === "dev" ? `${this.baseUrl}/fs?id=${flowsheetId}` : `/fs?id=${flowsheetId}`;
    this.putFSUrl = `${this.baseUrl}/fs?id=${flowsheetId}`;

    //Define model
    this.model = {}

    //Generate jointjs visualizer paper which displays joint js
    //if statment control when fv not show the paper should not render
    if(isFvShow) this.paper = new Paper(this);
    
    // Adding a special flag to mark that the graph changed
    this._is_graph_changed = false;
    
    // Setting name (key) that defines the save model time interval
    this._save_time_interval_key = 'save_time_interval';
    this._default_save_time_interval = 5000; // Default time interval
    this._save_time_interval = this.getSaveTimeInterval();
    this.setupGraphChangeChecker(this._save_time_interval, flowsheetId);
    
    //fetch model data from python server, once get data then render model and stream table
    //default is from sample_visualization if no ?example=1 etc. in url
    //define if fetch from example
    this.setGetFSUrl();

    /**
     * @param 
     */
    axios.get(this.getFSUrl)
    .then((response) => {
        console.log(this.getFSUrl)
        //get data from python server /fs
        this.model = response.data;
        //debug when flowsheet has no position it should not stack on each other
        isDevTest && this.debug_removeFlowsheetPosition(this.model);
        //render model
        if(isFvShow) this.renderModel(this.model); //this only run when fv is show
        //render stream table
        //if statment control when stream table not show the stream table should not render
        if(isStreamTableShow) this.stream_table = new StreamTable(this, this.model);
        this.toolbar = new Toolbar(this, this.paper, this.stream_table, this.flowsheetId, this.putFSUrl, this.isFvShow);
    })
    .catch((error) => {
        console.log(error.message);
        console.log(error.response.status);
    });
  }

  /**
   * Query from url check if has spcific example param in url
   * if has example param, and example param match examp_fv_arr then getFSUrl point to local example
   * if not getFSUrl point to python server /fs?id=
   */
  setGetFSUrl(){
      //search url to know which example to query
      let params = new URLSearchParams(window.location.search);

      //directly return is ok, default getFSUrl is defined in this
      if(!params.get("example")) return; 
      let whichExample = parseInt(params.get("example")!);

      //define what are examples
      //example 1 - 5 from example unit model reactor
      //example 6 from HDA flowsheet costing
      //example 7 from NGCC baseline and turndown cell 12, m.fs.gt.visualize()
      let example_fv_arr= ["example_1", "example_2", "example_3", "example_4", "example_5", "example_6", "example_7"];
      //check if searched example index param in range
      if(whichExample < 0 || whichExample >  example_fv_arr.length) return;

      //assign correct url to getFSUrl
      this.getFSUrl = `/assets/testing_data/example_${whichExample}.json`;
  }

  renderModel(model:any) {
      const jjCellConfig = new JointJsCellConfig(model);
      const processed_model = jjCellConfig.processRoutingConfig();
      this.paper.setup(processed_model);
  }

  /**
   * We need this dev testing to test when flowsheet cells has no positions the flowsheet
   * units should not stay on top of each other
   * @param model flowsheet model fetch from python server
   */
  debug_removeFlowsheetPosition(model:any){
    let myX = 5
    let myY = 5
    model.cells.forEach((el:any)=>{
      myX += 150
      // myY += 50
      if(el.position){
        el.position = {x:myX, y:undefined}
      }
    })
  }

  /**
   * Inform the user of some event.
   *
   * Do NOT use this for internal messages or debugging.
   *
   * @param level The level of 'severity' of the message. 0=info, 1=warning, 2=error
   * @param message The message to show
   * @param duration Duration, in seconds, to show the message. 0=forever
   */
  informUser(level:any, message:any) { //3rd param duration is removed since not in use
    // TODO: Write into a status area
    // Write to console
    switch(level) {
        case 0:
            console.log(message);
            break;
        case 1:
            console.warn(message);
            break;
        case 2:
            console.error(message);
            break;
        default:
            console.log(message);
    }
  }

  /**
   * Save current model value and then update with value in the Python process.
   *
   * This makes two calls to the server: first a PUT to save the current model, and
   * second a GET to retrieve the new values. If either of these fails, the method will fail
   * and not make any changes to its inputs.
   *
   * If this succeeds, the value of the model in the Paper instance will be replaced with the
   * new value sent from the server in the Python process.
   *
   * @param url The HTTP server that is running in the Python process
   * @param paper Instance of Paper that has model in 'model' attribute.
   */
  // refreshModel(url, paper) {
  //   // Inform user of progress (1)
  //   this.informUser(0, "Refresh: save current values from model");
  //   // First save our version of the model
  //   let clientModel = paper.graph;
  //   let clientData = JSON.stringify(clientModel.toJSON());
  //   $.ajax({url: url, type: 'PUT', contentType: "application/json", data: clientData})
  //       // On failure inform user and stop
  //       .fail(error => this.informUser(
  //           2, "Fatal error: cannot save current model before refresh: " + error))
  //       // On success, continue on to fetch new model
  //       .done(() => {
  //           // Inform user of progress (2)
  //           this.informUser(0, "Refresh: load new model values from Python program");
  //           $.ajax({url: url, dataType: "json"})
  //               // If we got the model, save it
  //               .done(data => {
  //                   // Display views before refreshing
  //                   const viewFlowsheet = document.querySelector("#view-flowsheet-btn");
  //                   const viewStreamTable = document.querySelector("#view-stream-table-btn");

  //                   const clickEvent = new MouseEvent('click');

  //                   if (!viewFlowsheet.checked) {
  //                       viewFlowsheet.dispatchEvent(clickEvent);
  //                   }
  //                   if (!viewStreamTable.checked) {
  //                       viewStreamTable.dispatchEvent(clickEvent);
  //                   }

  //                   // Refresh
  //                   this.renderModel(data);
  //                   this.stream_table.initTable(data);
  //               })
  //               // Otherwise fail
  //               .fail((jqXHR, textStatus, errorThrown) => {
  //                   this.informUser(2, "Fatal error: Could not retrieve new model from Python program: " +
  //                       textStatus + ", error=" + errorThrown);
  //               });
  //       });
  // }

    /**
     * Get the save time interval value from the application's setting block.
     */
  getSaveTimeInterval() {
    //question:
    //this is the old way to write setting_url question its key=" then concat, should I keep "?
    //let settings_url = `${this.baseUrl}/setting?setting_key="`.concat(this._save_time_interval_key);

    let settings_url = `${this.baseUrl}/setting?setting_key=${this._save_time_interval_key}`;
    let save_time_interval = this._default_save_time_interval;

    axios.get(settings_url, {
      headers: {
          'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      if (response.data.value != 'None') {
          save_time_interval = response.data.value;
      } else {
          this.informUser(
            1, 
            `Warning: save_time_interval was not set correctly. Default time value of 
            ${this._default_save_time_interval.toString()} 
            will be set.`
          );
      }
    })
    .catch((error) => {
      this.informUser(2, "Fatal error: cannot get setting value: " + error);
    });

    return save_time_interval;
  }

    /**
     * Set `_is_graph_changed` flag to true.
     *
     * An example application for this flag is to save the model whenever the
     * graph is changed.
     */
    graphChanged() {
      this._is_graph_changed = true;
    }

    /**
     * Setup an JS interval that check if the graph has changed and saveModel
     * if it does change.
     *
     * @param wait waiting time before actually saving the model
     */
    setupGraphChangeChecker(wait:any, flowsheetId:string) {
      // let model_id = $("#idaes-fs-name").data("flowsheetId");
      // let flowsheet_url = "/fs?id=".concat(flowsheetId);
      let flowsheet_url = this.putFSUrl;

      var graphChangedChecker = setInterval(() => {
          if (this._is_graph_changed) {
              this.saveModel(flowsheet_url, this.paper.graph);
              // reset flag
              this._is_graph_changed = false;
          }
      }, wait);
      return graphChangedChecker;
    }

    /**
     * Save the model value. Waiting time could be specified to
     * disable multiple redundant saves caused by a stream of events
     *
     * Changing cell positions & link vertices fire multiple events
     * subsequently. That's why we add waiting time before actually
     * saving the model.
     *
     * This sends a PUT to the server to save the current model value.
     *
     * @param url The HTTP server that is running in the Python process
     * @param model The model to save
     */
    saveModel(url:any, model:any) {
      let clientData = JSON.stringify(model.toJSON());
      axios.put(url, clientData, {
        headers: {
            'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log(`saved`)
        this.informUser(0, "Saved new model values");
      })
      .catch((error) => {
        this.informUser(2, "Fatal error: cannot save current model: " + error);
      });

      //old ajax request save for reference, clean up later
      // this.informUser(0, "Save current values from model");
      // $.ajax({url: url, type: 'PUT', contentType: "application/json", data: clientData})
      //     // On failure inform user and stop
      //     .fail(error => this.informUser(
      //         2, "Fatal error: cannot save current model: " + error))
      //     .done(() => {
      //         this.informUser(0, "Saved new model values");
      //     });
    }
}

// =====================
//    Main function
// =====================
// $( document ).ready(function() {
//     let flowsheetId = $("#idaes-fs-name").data("flowsheetId");
    // globalThis.app = new App(flowsheetId);
// });
