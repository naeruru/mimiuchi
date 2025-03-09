import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, shell } from 'electron'

import Store from 'electron-store'
import { WebSocketServer } from 'ws'
import { check_update } from './modules/check_update'
import { emit_osc, empty_queue } from './modules/osc'
import { TranslationPipeline } from './modules/transformers'

import { initialize_ws } from './modules/ws'

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
    Object.assign(window_config, { isMaximized: win.isMaximized() }, win.getNormalBounds())
    store.set('win_bounds', window_config)
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

// event for sending custom osc param
ipcMain.on('send-param-event', (event, args) => {
  emit_osc([args.route, args.value], args.ip, args.port)
})

let wss: WebSocketServer = null
// websocket events
ipcMain.on('start-ws', (event, args) => {
  wss = new WebSocketServer({ port: args })
  initialize_ws(win, wss, args)
    .then(() => {
      win.webContents.send('websocket-started', true)
    })
    .catch(() => {
      win.webContents.send('websocket-error', true)
    })
})

ipcMain.on('close-ws', () => {
  wss.close()
})

ipcMain.on('update-check', async () => {
  const latest = await check_update()
  win.webContents.send('update-check', latest)
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
