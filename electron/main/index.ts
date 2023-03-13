import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'os'
import { join } from 'path'

import { Bundle, Client } from 'node-osc'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(ROOT_PATH.public, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true, // was false
    },
  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})


function emit_osc (value, ip='127.0.0.1', port='9000') {
  const bundle = new Bundle(value)
  const client = new Client(ip, port)
  client.send(bundle)
  console.log(`${value[0]} -> ${value[1]}`)
}

// event listener that listens to the event emitted by Vue component
ipcMain.on("typing-text-event", (event, args) => {
  emit_osc(['/chatbox/typing', args])
})


ipcMain.on("send-text-event", (event, args) => {
  emit_osc(['/chatbox/input', args, true])
})


ipcMain.on("send-param-event", (event, args) => {
  emit_osc([args.route, args.value], args.ip, args.port)
})


// websocket server test
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8999 })
wss.on('connection', ws => {
  ws.on('message', message => {
    message = JSON.parse(message)

    console.log(`Received message => ${message.type}`)

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
      win.webContents.send('receive-text-event', message.data)
    }
  })
  ws.send('Hello! Message From Server!!')
  win.webContents.send('websocket-connect', true)
})