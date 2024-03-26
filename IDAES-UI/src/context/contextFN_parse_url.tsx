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
  }
  
  if(currentENV === "dev"){
    /*
      When env is dev, port and fv_id are fixed to 49999, 
      the port and id are setup in example.py fv_example()
    */
    //fixed port when example
    const server_port= 49999;
    //fixed id when example
    const fv_id = "sample_visualization";
    return {server_port, fv_id};
  }
}