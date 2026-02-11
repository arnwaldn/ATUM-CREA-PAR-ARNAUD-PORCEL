import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import Store from 'electron-store'

const store = new Store({
  defaults: {
    theme: 'system',
    windowBounds: { width: 1200, height: 800, x: undefined, y: undefined },
  },
})

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const bounds = store.get('windowBounds') as {
    width: number
    height: number
    x?: number
    y?: number
  }

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds()
      store.set('windowBounds', bounds)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('get-store-value', (_, key: string) => store.get(key))

ipcMain.handle('set-store-value', (_, key: string, value: unknown) => {
  store.set(key, value)
  return true
})

ipcMain.handle('select-file', async (_, options?: Electron.OpenDialogOptions) => {
  if (!mainWindow) return null

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    ...options,
  })

  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`)
  }
})

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}`)
  }
})

ipcMain.handle('show-save-dialog', async (_, options?: Electron.SaveDialogOptions) => {
  if (!mainWindow) return null

  const result = await dialog.showSaveDialog(mainWindow, options ?? {})
  if (result.canceled) return null
  return result.filePath
})

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
