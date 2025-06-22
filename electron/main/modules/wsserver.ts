import { Buffer } from 'node:buffer'
import { emit_osc } from './osc'

// Attach listeners to WebSocket server and handle WebSocket clients
function initialize_wsserver(win: any, websocketserver: any) {
  return new Promise((resolve, reject) => {
    // websocketserver: the mimiuchi Desktop WebSocket server
    // websocketclient: a WebSocket from the outside that has connected to the mimiuchi Desktop WebSocket server

    websocketserver.on('error', (error) => {
      if (error instanceof Error) {
        reject(error)
      }
      else {
        reject(new Error(String(error)))
      }
    })

    websocketserver.on('connection', (websocketclient, request) => {
      const ip: string = request.socket.remoteAddress
      win.webContents.send('mimiuchi-websocketserver-client-connected', true, ip)

      websocketclient.on('close', (code: number, reason_raw: string) => {
        const reason = Buffer.isBuffer(reason_raw) ? reason_raw.toString() : String(reason_raw)
        win.webContents.send('mimiuchi-websocketserver-client-disconnected', false, { ip, code, reason })
      })

      websocketclient.on('message', (message) => {
        message = JSON.parse(message)

        console.log(`WS => ${message.type}`)

        if (message.type === 'command') {
          console.log(`Received command: ${message.data}`)

          switch (message.data) {
            case 'stop':
              win.webContents.send('websocket-connect', false)
              break
            case 'speechstart':
              emit_osc(['/chatbox/typing', true])
              break
            case 'speechend':
              emit_osc(['/chatbox/typing', false])
              break
            default:
              break
          }
        }
        else if (message.type === 'text') {
          win.webContents.send('receive-text-event', JSON.stringify(message.data))
        }
      })
    })

    resolve(websocketserver)
  })
}

export { initialize_wsserver }
