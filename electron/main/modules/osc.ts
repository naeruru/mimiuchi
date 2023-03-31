import { Bundle, Client } from 'node-osc'

/* emit_osc()
 *  emits an osc value to specified ip:port
 *
 * value (array): osc bundle containing parameter route and arguments
 * ip (string): ip to send bundle to
 * port (number): port to send bundle to 
*/
export function emit_osc(value: any, ip: string = '127.0.0.1', port: number = 9000) {
    const bundle = new Bundle(value)
    const client = new Client(ip, port)
    client.send(bundle)
    console.log(`${value[0]} -> ${value[1]}`)
}