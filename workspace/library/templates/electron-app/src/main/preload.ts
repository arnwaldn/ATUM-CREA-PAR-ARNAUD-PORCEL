import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getStoreValue: (key: string) => Promise<unknown>
  setStoreValue: (key: string, value: unknown) => Promise<boolean>
  selectFile: (options?: Electron.OpenDialogOptions) => Promise<string | null>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  showSaveDialog: (options?: Electron.SaveDialogOptions) => Promise<string | null>
  onUpdateAvailable: (callback: (version: string) => void) => void
  platform: NodeJS.Platform
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, version) => callback(version))
  },
  platform: process.platform,
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
