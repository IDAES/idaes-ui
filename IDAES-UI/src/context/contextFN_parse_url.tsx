/**
 * function use to parse url and return to context
 * now only return port number
 * @returns current port number
 */
export function context_parse_url(){
  const server_port= window.location.port;
  const urlSearch = new URLSearchParams(window.location.search);
  const fv_id = urlSearch.get("id");
  return {server_port, fv_id};
}