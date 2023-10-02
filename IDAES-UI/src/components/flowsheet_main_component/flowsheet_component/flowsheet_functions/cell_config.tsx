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
 * 
 * Author: Abdelrahman Elbashandy <aaelbashandy@lbl.gov>
 */

/**
 * Interpret cell configuration specified by each icon chosen in the model.
 * Configuring cell parameters such as the routing paths that are taken by
 * links connecting unit models.
 */
declare var joint: any;
declare var g:any;

interface sourceDestinatio {source:{x:number, y:number}, destination:{x:number, y:number}};

export class JointJsCellConfig {
    _model:any;
    constructor(model:any) {
	    this._model = model;
	}
    
	get model() {
	    return this._model
	}
    
	set model(model) {
	    this._model = model;
	}

    /**
     * Finding the correct cell index based on the given cell name 'cellName'
     * 
     * when:
     * 
     * arg:cellName == cell.id, arg: cellType == cell.type
     * return the index
     */
    findCellIndex(cellName:any, cellType:any) {
      for (let i = 0; i < this.model['cells'].length; i++) {
          const cell = this.model['cells'][i];
          if (cell.id == cellName && cell.type == cellType) {
              return i;
          }
      }
      // If an index is not returned, that means the link was not found
      throw new Error(`Link with linkName: ${cellName} was not found`);
    }

    /**
     * Generate a custom function that handles the router 'gap' option.
     * The 'gap' option is specified by the users to choose the two vertices
     * that the link will take to connect the unit models (elements).
     */
    routerGapFnFactory(gap:sourceDestinatio) {
        // Link router functions in JointJS execute automatically when their
        // elements that they are connected to rotate.
        let router_fn = (vertices:any, opt:any, linkView:any) => {

            const src = linkView.getEndAnchor('source');
            const tgt = linkView.getEndAnchor('target');

            // Calculates the original points that the link has to go through
            // to give the effect of having a gap.
            const p1 = new g.Point(
                src.x + gap.source.x,
                src.y + gap.source.y
            );
            const p2 = new g.Point(
                tgt.x + gap.destination.x,
                tgt.y + gap.destination.y
            );

            // Getting the current angles of the icons to calculate the right
            // position for the original points calculated above
            const src_angle = linkView.getEndView('source').model.angle();
            const tgt_angle = linkView.getEndView('target').model.angle();

            // Flip direction if perpendicular
            const src_orth = src_angle % 180 === 0 ? 1 : -1;
            const tgt_orth = tgt_angle % 180 === 0 ? 1 : -1;

            // Rotate the vector based on the angle of the element
            const src_rotated = p1.rotate(src, src_orth * src_angle);
            const tgt_rotated = p2.rotate(tgt, tgt_orth * tgt_angle);

            // TODO: Research if there's a better pre-implemented router
            // function than the manhattan function.
            return joint.routers.manhattan([src_rotated, ...vertices, tgt_rotated], opt, linkView);
        }

        return router_fn;
    }

    /**
     * Read the routing config for each link in jointjs and create a custom
     * routing function for it based on the routing configuration.
     */
	  processRoutingConfig() {
        const src = "source";
        const dest = "destination";
        const routing_config = this._model.routing_config;

        for (let linkName in routing_config) {
            // Because the jointjs object expects all the cell objects to exist
            // in an array, then we gotta find the right index for that link.
            const cell_index = this.findCellIndex(linkName, "standard.Link");

            // Create routing function
            let sourceDestination = routing_config[linkName].cell_config.gap; //{source:{...}, destination:{...}}
            let routing_fn = this.routerGapFnFactory(sourceDestination);
            
            // Assign the routing function to the right cell/link
            // this funtion stored in model.cells.router will trigger by jjs when render
            this._model['cells'][cell_index].router = routing_fn;
        }

        /**
         * This is checker if cells has labels
         * * SVG render layer base on which element render first, then its stay at bottom
         * _model.cells.label is array contain 2 item.
         * 1. link tag
         * 2. label
         * we have to reverse it or link tag will cover the content of the label
         * 
         * TODO: this can be fix later in python server populate the json data in correct order.
         */
        this._model.cells.map((el:any)=>{
            if(el.labels && el.labels[1].position){
                el.labels.reverse();
                return el;
            }
        })
        
        return this._model;
	}
};
