
module.exports = {
  logging:{
    level: 'verbose'
  },
  screenshots: true,
  video : false,
  e2e: {
    baseUrl: "http://127.0.0.1:49999/?id=sample_visualization",
    pageLoadTimeout: 100000,
    taskTimeout: 100000,
    responseTimeout: 60000
  }  
}