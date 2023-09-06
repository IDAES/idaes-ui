/**
 * This function is use to help app get correct api end point port
 * and flowsheet id.
 * 
 * it read environment variable VITE_MODE which is either prod or dev
 * to identify app is in which mode.
 * 
 * when dev mode the port should be read from json file:
 * because the vite will start on 5173, the python server port is random port two app isolated.
 * 
 * when prod mode the port is reading from url:
 * because python server dist folder
 * 
 * @param none
 * @returns current port number
 */
import shared_variable from "./shared_variable.json";

const currentENV = import.meta.env.VITE_MODE;

export function context_parse_url(){
  
  
  if(currentENV === "prod"){
    /**
     * When env is prod read server port and fv id from url
     */
    const server_port= window.location.port;
    const urlSearch = new URLSearchParams(window.location.search);
    const fv_id = urlSearch.get("id");
    return {server_port, fv_id};
  }else{
    /*
      When env is dev, read server port, fv id, from shared_variable.json, 
      this file is create and update by python server, everytime when server start.
    */
    //get server port
    const server_port= shared_variable.port;

    //base on url, get id
    const url = new URL(shared_variable.url);
    const urlSearch = new URLSearchParams(url.search);
    const fv_id = urlSearch.get("id");
    return {server_port, fv_id};
  }
}