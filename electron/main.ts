import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as http from 'http'
import * as fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null = null
let server: http.Server | null = null
let localServerPort: number | null = null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function startLocalServer(distPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let reqUrl = req.url || '/'
      const qIndex = reqUrl.indexOf('?')
      if (qIndex !== -1) {
        reqUrl = reqUrl.substring(0, qIndex)
      }
      const hIndex = reqUrl.indexOf('#')
      if (hIndex !== -1) {
        reqUrl = reqUrl.substring(0, hIndex)
      }

      let reqPath = decodeURIComponent(reqUrl)
      if (reqPath === '/' || !reqPath.includes('.')) {
        reqPath = '/index.html'
      }

      const filePath = path.join(distPath, reqPath)

      fs.readFile(filePath, (err, data) => {
        if (err) {
          const indexPath = path.join(distPath, 'index.html')
          fs.readFile(indexPath, (indexErr, indexData) => {
            if (indexErr) {
              res.writeHead(404, { 'Content-Type': 'text/plain' })
              res.end('Not Found')
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(indexData)
            }
          })
          return
        }

        let ext = path.extname(filePath).toLowerCase()
        let contentType = 'text/html'
        if (ext === '.js' || ext === '.mjs') contentType = 'application/javascript'
        else if (ext === '.css') contentType = 'text/css'
        else if (ext === '.json') contentType = 'application/json'
        else if (ext === '.png') contentType = 'image/png'
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        else if (ext === '.svg') contentType = 'image/svg+xml'
        else if (ext === '.ico') contentType = 'image/x-icon'

        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data)
      })
    })

    server.listen(0, '127.0.0.1', () => {
      const addr = server?.address()
      if (addr && typeof addr === 'object') {
        resolve(addr.port)
      } else {
        reject(new Error('Failed to resolve server address'))
      }
    })
  })
}

function setupMenu() {
  const template: Electron.MenuItemConstructorOptions[] = []

  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  // File Menu
  template.push({
    label: 'File',
    submenu: [
      process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
    ]
  })

  // Edit Menu
  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  })

  // View Menu
  template.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  })

  // Window Menu
  template.push({
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(process.platform === 'darwin' ? [
        { type: 'separator' as const },
        { role: 'front' as const },
        { type: 'separator' as const },
        { role: 'window' as const }
      ] : [
        { role: 'close' as const }
      ])
    ]
  })

  // Help Menu
  template.push({
    role: 'help',
    submenu: [
      {
        label: 'ESD Documentation',
        click: async () => {
          await shell.openExternal('https://eigenspace.com')
        }
      }
    ]
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

async function createWindow() {
  if (!VITE_DEV_SERVER_URL && !localServerPort) {
    try {
      localServerPort = await startLocalServer(process.env.DIST || '')
    } catch (e) {
      console.error('Failed to start production local HTTP server:', e)
    }
  }

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ESD',
    icon: path.join(__dirname, 'icons/esd.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.webContents.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else if (localServerPort) {
    win.loadURL(`http://localhost:${localServerPort}/`)
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (server) {
    server.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let simulatedUpdateInterval: NodeJS.Timeout | null = null

function setupAutoUpdater() {
  ipcMain.on('check-for-updates', () => {
    if (!win) return
    
    if (app.isPackaged) {
      autoUpdater.checkForUpdates().catch((err) => {
        win?.webContents.send('update-status', 'error', err.message || err)
      })
    } else {
      win.webContents.send('update-status', 'checking')
      setTimeout(() => {
        if (!win) return
        const mockVersionInfo = {
          version: '1.0.1',
          releaseDate: new Date().toISOString(),
          releaseNotes: 'Simulation Mode: Faster loading speeds, sleek new route protection wrappers, and update check dialog updates!'
        }
        win.webContents.send('update-status', 'update-available', mockVersionInfo)
        
        let progress = 0
        if (simulatedUpdateInterval) clearInterval(simulatedUpdateInterval)
        simulatedUpdateInterval = setInterval(() => {
          if (!win) {
            if (simulatedUpdateInterval) clearInterval(simulatedUpdateInterval)
            return
          }
          progress += 20
          win.webContents.send('update-status', 'download-progress', progress)
          if (progress >= 100) {
            if (simulatedUpdateInterval) clearInterval(simulatedUpdateInterval)
            win.webContents.send('update-status', 'update-downloaded', mockVersionInfo)
          }
        }, 800)
      }, 1500)
    }
  })

  ipcMain.on('install-update', () => {
    if (app.isPackaged) {
      autoUpdater.quitAndInstall()
    } else {
      console.log('Simulation: Relaunching application...')
      app.relaunch()
      app.exit(0)
    }
  })

  if (app.isPackaged) {
    autoUpdater.autoDownload = false

    autoUpdater.on('checking-for-update', () => {
      win?.webContents.send('update-status', 'checking')
    })

    autoUpdater.on('update-available', (info) => {
      win?.webContents.send('update-status', 'update-available', info)
      autoUpdater.downloadUpdate()
    })

    autoUpdater.on('update-not-available', (info) => {
      win?.webContents.send('update-status', 'update-not-available', info)
    })

    autoUpdater.on('error', (err) => {
      win?.webContents.send('update-status', 'error', err.message || err)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      win?.webContents.send('update-status', 'download-progress', progressObj.percent)
    })

    autoUpdater.on('update-downloaded', (info) => {
      win?.webContents.send('update-status', 'update-downloaded', info)
    })
  }
}

app.whenReady().then(() => {
  setupMenu()
  setupAutoUpdater()
  
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, 'logo-2.png'))
  }
  
  createWindow()
})
