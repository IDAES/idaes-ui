/**
 * This file here is setup a universal style for jointjs labels
 * In other file's event handler which will toggle labels, just import this file
 */
const labelStyleLabelOn = {
  attrs:{
    g:{
    },
    text:{
      "display": "block",
      "font-size": "7",
      "text-anchor":"left"
    },
    rect : {
      "width":"2000",
      "height":"2000",
      "fill":"white",
      "rx":0,
      "ry":0,
      "fill-opacity" : "1",
    },
    tspan:{
      fill:"white",
      dy:10
    }
  }
}

const labelStyleLabelOff = {
  attrs:{
    text:{
      display: "none"
    },
    rect : {
      "fill-opacity" : "0"
    }
  }
}

const labelIndex = 0;
const slinkLabelIndex = 1;

export {
  labelStyleLabelOn, 
  labelStyleLabelOff, 
  labelIndex, 
  slinkLabelIndex
};