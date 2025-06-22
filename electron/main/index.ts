import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { BrowserWindow, app, ipcMain, shell } from 'electron'

import { WebSocket, WebSocketServer } from 'ws'
import Store from 'electron-store'
import { emit_osc, empty_queue } from './modules/osc'
import { initialize_wsserver } from './modules/wsserver'
import { check_update } from './modules/check_update'

import { TranslationPipeline } from './modules/transformers'

// import { nativeImage } from 'electron'
// const image = nativeImage.createFromPath(`${app.getAppPath()}/public/logo-256x256.png`)
// app.dock?.setIcon(image)

const store = new Store()

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

const window_config: any = {
  title: 'Main window',
  width: 1000,
  height: 700,
  icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
  frame: false,
  titleBarStyle: 'hidden',
  trafficLightPosition: { x: 10, y: 10 },
  webPreferences: {
    preload,
    // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
    // nodeIntegration: true,

    // Consider using contextBridge.exposeInMainWorld
    // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
    // contextIsolation: false,
    nodeIntegration: true,
    contextIsolation: true,
  },
}

async function createWindow() {
  Object.assign(window_config, store.get('win_bounds'))
  win = new BrowserWindow(window_config)

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }
  else {
    win.loadFile(indexHtml)
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
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  win.on('maximize', () => win.webContents.send('maximized_state', true))
  win.on('unmaximize', () => win.webContents.send('maximized_state', false))
  win.on('close', () => {
    const update_obj = {}
    Object.assign(update_obj, { isMaximized: win.isMaximized() }, win.getNormalBounds())
    store.set('win_bounds', update_obj)
  })
  win.webContents.once('dom-ready', () => {
    if (window_config.isMaximized)
      win.webContents.send('maximized_state', true)
  })
}

// const transformersWorkerPath = `file://${path.join(process.env.APP_ROOT, 'src', 'worker.mjs').replace('app.asar', 'app.asar.unpacked')}`
// const transformersWorker = new Worker(new URL(transformersWorkerPath, import.meta.url))

// const transformersPath = `file://${path.join(process.env.APP_ROOT, 'node_modules', '@xenova', 'transformers', 'src', 'transformers.js').replace('app.asar', 'app.asar.unpacked')}`
// transformersWorker.postMessage({ type: 'transformers-init', data: transformersPath })

app.whenReady().then(() => {
  if (store.get('auto-open-web-app-on-launch')) {
    shell.openExternal('https://mimiuchi.com/')
  }

  createWindow()
})

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
  }
  else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL)
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
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
let text_queue = []
ipcMain.on('send-text-event', (event, args) => {
  args = JSON.parse(args)
  const new_text = args.transcript.includes(' ') ? args.transcript.match(/.{1,140}(\s|$)/g) : args.transcript.match(/.{1,140}/g)
  text_queue = [...text_queue, ...new_text]
  if (text_queue.length >= 1)
    empty_queue(text_queue, args.hide_ui, args.sfx)
})

// event for sending osc messages
ipcMain.on('send-osc-message', (event, args) => {
  emit_osc([args.route, args.value], args.ip, args.port)
})

let wsserver: WebSocketServer = null
// websocket events
ipcMain.on('start-mimiuchi-websocketserver', (event, args) => {
  wsserver = new WebSocketServer({ port: args })

  initialize_wsserver(win, wsserver)
    .then(() => {
      win.webContents.send('mimiuchi-websocketserver-started')
    })
    .catch((error) => {
      win.webContents.send('mimiuchi-websocketserver-error', error)
    })
})

ipcMain.on('close-mimiuchi-websocketserver', () => {
  if (!wsserver) return

  win.webContents.send('mimiuchi-websocketserver-close')

  wsserver.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN)
      client.close(1001, 'mimiuchi WebSocket server shut down.')
  })

  wsserver.close(() => {
    win.webContents.send('mimiuchi-websocketserver-closed')
  })

  wsserver.removeAllListeners()

  wsserver = null
})

ipcMain.on('update-check', async () => {
  const latest = await check_update()
  win.webContents.send('update-check', latest)
})

// Setting: Open web app on app launch
ipcMain.handle('get-auto-open-web-app-on-launch', () => {
  return store.get('auto-open-web-app-on-launch', false)
})

ipcMain.on('set-auto-open-web-app-on-launch', (event, newValue) => {
  store.set('auto-open-web-app-on-launch', newValue)
})

ipcMain.on('delete-auto-open-web-app-on-launch', () => {
  store.delete('auto-open-web-app-on-launch')
})

// Translations
//
// Footer (user submission)
// → Speech Store
// → [Condition: translations are enabled]
// → Electron ('transformers-translate')
// → Worker (worker thread)
// → Electron ('transformers-translate-output')
// → Footer ('transformers-translate-render')

ipcMain.on('transformers-translate', async (event, args) => {
  // transformersWorker.postMessage({ type: 'transformers-translate', data: args })
  const translator = new TranslationPipeline()
  translator.translate(win, args)
})
