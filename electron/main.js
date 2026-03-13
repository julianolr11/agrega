import { app, BrowserWindow, Menu, shell, session, ipcMain } from 'electron'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import os from 'node:os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure writable userData/cache paths (avoid cache errors when run from read-only dirs)
const userDataPath = path.join(app.getPath('appData'), 'Agrega')
app.setPath('userData', userDataPath)

let mainWindow
let splashWindow

const SYNC_PORT = 3111
const syncState = {
  pin: '',
  payload: null,
}

const generatePin = () => String(Math.floor(1000 + Math.random() * 9000))

const getLocalHost = () => {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (!net.internal && net.family === 'IPv4') {
        if (net.address.startsWith('10.') || net.address.startsWith('192.168.') || net.address.startsWith('172.')) {
          return net.address
        }
      }
    }
  }
  return 'localhost'
}

const isDev = process.env.ELECTRON_IS_DEV === 'true' || !app.isPackaged
const distPath = path.join(__dirname, '../dist')
const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, 'assets')
const appIcon = path.join(assetsPath, 'agregaico.ico')
const splashLogo = path.join(assetsPath, 'agrega-logo.png')

const loadSplashLogoDataUrl = () => {
  try {
    const bytes = fs.readFileSync(splashLogo)
    return `data:image/png;base64,${bytes.toString('base64')}`
  } catch (err) {
    console.error('Failed to load splash logo, falling back to file path', err)
    return `file://${splashLogo.replace(/\\/g, '/')}`
  }
}

const createSplashWindow = () => {
  const splashLogoUrl = loadSplashLogoDataUrl()

  splashWindow = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    transparent: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    show: true,
    backgroundColor: '#0b0f1a',
    icon: appIcon,
  })

  const splashHtml = `<!doctype html><html><head><meta charset="UTF-8"><title>Agrega</title><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#0b0f1a;font-family:'Inter',system-ui,sans-serif;} .card{padding:24px 32px;border-radius:16px;background:linear-gradient(135deg,#1c2233,#0f172a);box-shadow:0 20px 70px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.04);display:flex;flex-direction:column;align-items:center;} .logo{width:140px;height:auto;filter:drop-shadow(0 10px 26px rgba(0,0,0,0.35));}</style></head><body><div class="card"><img class="logo" src="${splashLogoUrl}" alt="Agrega logo" /></div></body></html>`

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`)
}

const hashPayload = (payload) => {
  try {
    const json = JSON.stringify(payload || {})
    return crypto.createHash('sha256').update(json).digest('hex')
  } catch (error) {
    return ''
  }
}

const mergeSyncPayload = (current = {}, incoming = {}) => {
  const mapById = (list = []) => {
    const map = new Map()
    list.forEach(item => {
      if (!item) return
      const key = item.id || `${item.url || ''}-${item.title || ''}`
      if (!key) return
      if (!map.has(key)) map.set(key, { ...item, id: key })
    })
    return map
  }

  const mergedLinks = () => {
    const map = mapById(current.links)
    mapById(incoming.links).forEach((value, key) => {
      if (!map.has(key)) map.set(key, value)
    })
    return Array.from(map.values())
  }

  const mergedReminders = () => {
    const map = mapById(current.reminders)
    mapById(incoming.reminders).forEach((value, key) => {
      if (!map.has(key)) map.set(key, value)
    })
    return Array.from(map.values())
  }

  return {
    type: 'agrega-sync',
    version: incoming.version || current.version || 1,
    generatedAt: new Date().toISOString(),
    language: incoming.language || current.language,
    pin: incoming.pin || current.pin,
    categories: Array.from(new Set([...(current.categories || []), ...(incoming.categories || [])])),
    links: mergedLinks(),
    reminders: mergedReminders(),
  }
}

const startSyncServer = () => {
  if (!syncState.pin) {
    syncState.pin = generatePin()
  }
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${SYNC_PORT}`)
    if (url.pathname !== '/sync') {
      res.statusCode = 404
      res.end('not found')
      return
    }

    // CORS headers for LAN access from mobile/web
    res.setHeader('access-control-allow-origin', '*')
    res.setHeader('access-control-allow-methods', 'GET,POST,HEAD,OPTIONS')
    res.setHeader('access-control-allow-headers', 'content-type')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    const reqPin = url.searchParams.get('pin') || ''
    if (syncState.pin && reqPin !== syncState.pin) {
      res.statusCode = 401
      res.end('invalid pin')
      return
    }

    if (req.method === 'HEAD') {
      const clientHash = url.searchParams.get('hash') || ''
      const serverHash = hashPayload(syncState.payload)
      if (clientHash && serverHash && clientHash === serverHash) {
        res.statusCode = 304
        res.end()
        return
      }
      res.statusCode = 200
      res.setHeader('x-sync-hash', serverHash)
      res.end()
      return
    }

    if (req.method === 'GET') {
      res.setHeader('content-type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ status: 'ok', payload: syncState.payload, hash: hashPayload(syncState.payload) }))
      return
    }

    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}')
          const incoming = data.payload || data || {}
          const merged = mergeSyncPayload(syncState.payload || {}, incoming)
          syncState.payload = merged
          res.statusCode = 200
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ status: 'merged', hash: hashPayload(merged) }))
        } catch (error) {
          res.statusCode = 400
          res.end('invalid json')
        }
      })
      return
    }

    res.statusCode = 405
    res.end('method not allowed')
  })

  server.listen(SYNC_PORT, '0.0.0.0', () => {
    console.info(`[sync] listening on port ${SYNC_PORT}`)
  })
  server.on('error', (err) => {
    console.error('[sync] server error', err)
  })
}

const createMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 780,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    backgroundColor: '#0b0f1a',
    title: 'Agrega',
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  const pageUrl = isDev && process.env.VITE_DEV_SERVER_URL
    ? process.env.VITE_DEV_SERVER_URL
    : `file://${path.join(distPath, 'index.html')}`

  console.info('Loading renderer from', pageUrl)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  try {
    await mainWindow.loadURL(pageUrl)
  } catch (error) {
    console.error('Failed to load renderer', error)
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.info('Renderer finished load')
    splashWindow?.close()
    splashWindow = null
    mainWindow.show()
    if (!isDev) {
      mainWindow.setMenuBarVisibility(false)
    }
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDesc, url) => {
    console.error('Renderer failed to load', { errorCode, errorDesc, url })
    splashWindow?.close()
    splashWindow = null
    mainWindow.show()
  })

  // Fallback: ensure splash closes even if load events misfire
  setTimeout(() => {
    if (!mainWindow.isVisible()) {
      console.warn('Fallback: showing main window after timeout')
      mainWindow.show()
    }
    if (splashWindow) {
      splashWindow.close()
      splashWindow = null
    }
  }, 7000)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.once('ready-to-show', () => {
    // Keep splash brief; show main as soon as it's ready
    splashWindow?.close()
    splashWindow = null
    mainWindow.show()
    if (!isDev) {
      mainWindow.setMenuBarVisibility(false)
    }
  })
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null)

  ipcMain.handle('agrega:sync:push', (_event, { pin, payload } = {}) => {
    if (typeof pin === 'string') {
      syncState.pin = pin
    }
    if (payload) {
      syncState.payload = payload
    }
    return { status: 'ok', hash: hashPayload(syncState.payload), host: getLocalHost(), port: SYNC_PORT, pin: syncState.pin }
  })

  ipcMain.handle('agrega:sync:get', () => ({ pin: syncState.pin, payload: syncState.payload, hash: hashPayload(syncState.payload), host: getLocalHost(), port: SYNC_PORT }))

  startSyncServer()

  // Route Chromium cache to a writable location
  try {
    const cachePath = path.join(app.getPath('userData'), 'Cache')
    await session.defaultSession.setCachePath(cachePath)
  } catch (err) {
    console.error('Failed to set cache path', err)
  }

  createSplashWindow()
  await createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
