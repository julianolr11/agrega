import { app, BrowserWindow, Menu, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow
let splashWindow

const isDev = process.env.ELECTRON_IS_DEV === 'true' || !app.isPackaged
const distPath = path.join(__dirname, '../dist')
const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, 'assets')
const appIcon = path.join(assetsPath, 'agregaico.jpg')
const splashLogo = path.join(assetsPath, 'agrega-logo.png')

const createSplashWindow = () => {
  const splashLogoUrl = `file://${splashLogo.replace(/\\/g, '/')}`

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

  const splashHtml = `<!doctype html><html><head><meta charset="UTF-8"><title>Agrega</title><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#0b0f1a;font-family:'Inter',system-ui,sans-serif;color:#f7f8fb;letter-spacing:0.04em;} .card{padding:24px 32px;border-radius:16px;background:linear-gradient(135deg,#1c2233,#0f172a);box-shadow:0 20px 70px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.04);display:flex;flex-direction:column;align-items:center;gap:10px;} .title{font-size:28px;font-weight:700;margin:0;text-align:center;} .subtitle{margin:0;text-align:center;color:#c7cde5;font-size:14px;} .logo{width:120px;height:auto;filter:drop-shadow(0 10px 26px rgba(0,0,0,0.35));}</style></head><body><div class="card"><img class="logo" src="${splashLogoUrl}" alt="Agrega logo" /><div class="title">Agrega</div><p class="subtitle">organize seus links</p></div></body></html>`

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`)
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  try {
    await mainWindow.loadURL(pageUrl)
  } catch (error) {
    console.error('Failed to load renderer', error)
  }

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
