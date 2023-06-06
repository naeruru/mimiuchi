import pkg from '../../../package.json'
import { emit_osc } from './osc'
import { WebSocketServer } from 'ws'

/*
 * websocket control
 */
function initialize_ws(win: any, wss: any, port: number) {
    return new Promise((resolve, reject) => {
        // wss = new WebSocketServer({ port: port })
        wss.on('error', error => reject(error))
        wss.on('connection', ws => {
            ws.on('message', message => {
                message = JSON.parse(message)
        
                console.log(`WS => ${message.type}`)
        
                if (message.type === 'command') {
                    console.log(`Received command: ${message.data}`)
                    switch(message.data) {
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
                } else if (message.type === 'text') {
                    win.webContents.send('receive-text-event', JSON.stringify(message.data))
                }
            })
            ws.send(`{"event": "connect", "msg":"connected to websocket ( •̀ ω •́ )", "version":"${pkg.version}"}`)
            win.webContents.send('websocket-connect', true)
        })
        wss.on('open', () => resolve(wss))
    })
}

function close_ws(wss: any) {
    wss.close()
}

export { initialize_ws, close_ws }