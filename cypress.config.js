const fs = require('fs')
const path = require('path')

//read port and flowsheet name from shared_variable.json
const sharedVariables = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "/shared_variable.json")
  )
);

module.exports = {
  logging:{
    level: 'verbose'
  },
  screenshots: true,
  video : false,
  e2e: {
    baseUrl: sharedVariables.url,
    pageLoadTimeout: 100000,
    taskTimeout: 100000,
    responseTimeout: 60000
  }  
}