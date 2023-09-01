/**
 * function use to parse url and return to context
 * now only return port number
 * @returns current port number
 */
export function context_parse_url(){
  const server_port= window.location.port;
  return server_port;
}