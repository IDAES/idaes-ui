const labelStyleLabelOn = {
  attrs:{
    g:{
    },
    text:{
      "transform" : "tranlate(30,30)",
      "display": "block",
      "font-size": "8",
      "text-anchor":"left"
    },
    rect : {
      "width":"2000",
      "height":"2000",
      "fill":"black",
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

export {labelStyleLabelOn, labelStyleLabelOff}