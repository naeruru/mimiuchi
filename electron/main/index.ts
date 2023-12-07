import { join } from 'node:path'
import { BrowserWindow, app, ipcMain, shell } from 'electron'

import Store from 'electron-store'

import { WebSocketServer } from 'ws'
import { emit_osc, empty_queue } from './modules/osc'
import { initialize_ws } from './modules/ws'
import { check_update } from './modules/check_update'

const store = new Store()

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// export const ROOT_PATH = {
//   // /dist
//   dist: join(__dirname, '../..'),
//   // /dist or /public
//   public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
// }

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

let wss: any

const window_config: any = {
  title: 'Main window',
  width: 1000,
  height: 700,
  icon: join(process.env.PUBLIC, 'favicon.ico'),
  frame: false,
  webPreferences: {
    preload,
    // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
    // Consider using contextBridge.exposeInMainWorld
    // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
    nodeIntegration: true,
    contextIsolation: true, // was false
  },
}

async function createWindow() {
  Object.assign(window_config, store.get('win_bounds'))
  win = new BrowserWindow(window_config)

  if (window_config.isMaximized)
    win.maximize()

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }
  else {
    // win.removeMenu()
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  win.on('maximize', () => win.webContents.send('maximized_state', true))
  win.on('unmaximize', () => win.webContents.send('maximized_state', false))
  win.on('close', () => {
    Object.assign(window_config, { isMaximized: win.isMaximized() }, win.getNormalBounds())
    store.set('win_bounds', window_config)
  })
  win.webContents.once('dom-ready', () => {
    if (window_config.isMaximized)
      win.webContents.send('maximized_state', true)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()
  else
    createWindow()
})

// new window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL)
    childWindow.loadURL(`${url}#${arg}`)
  else
    childWindow.loadFile(indexHtml, { hash: arg })
})

/*
 * event listeners that listens to the event emitted by Vue component
 */
// event for closing application
ipcMain.on('close_app', () => {
  app.quit()
})
// event for toggling maximized
ipcMain.on('toggle_maximize', () => {
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
// event for minimizing
ipcMain.on('minimize', () => {
  win.minimize()
})

// event for text typing indicator
ipcMain.on('typing-text-event', (event, args) => {
  emit_osc(['/chatbox/typing', args])
})

// event for sending text
export let text_queue = []
ipcMain.on('send-text-event', (event, args) => {
  args = JSON.parse(args)
  const new_text = args.transcript.includes(' ') ? args.transcript.match(/.{1,140}(\s|$)/g) : args.transcript.match(/.{1,140}/g)
  text_queue = [...text_queue, ...new_text]
  if (text_queue.length >= 1)
    empty_queue(text_queue, args.hide_ui, args.sfx)
})

// event for sending custom osc param
ipcMain.on('send-param-event', (event, args) => {
  emit_osc([args.route, args.value], args.ip, args.port)
})

// websocket events
ipcMain.on('start-ws', (event, args) => {
  wss = new WebSocketServer({ port: args })
  initialize_ws(win, wss, args)
    .then((ws: WebSocket) => {
      win.webContents.send('websocket-started', true)
    })
    .catch((error: any) => {
      win.webContents.send('websocket-error', true)
    })
})
ipcMain.on('close-ws', (event, args) => {
  wss.close()
})

ipcMain.on('update-check', async (event) => {
  const latest = await check_update()
  win.webContents.send('update-check', latest)
})
