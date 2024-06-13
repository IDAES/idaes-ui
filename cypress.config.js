module.exports = {
  logging:{
    level: 'verbose'
  },
  screenshots: true,
  video : false,
  e2e: {
    baseUrl: "http://localhost:49999/app?id=sample_visualization",
    pageLoadTimeout: 100000,
    taskTimeout: 100000,
    responseTimeout: 60000
  }  
}