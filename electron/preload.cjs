const { contextBridge, shell, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('agrega', {
  ping: () => 'ready',
  openExternal: (url) => {
    if (!url) return
    shell.openExternal(url)
  },
  syncPush: async ({ pin, payload }) => {
    try {
      return await ipcRenderer.invoke('agrega:sync:push', { pin, payload })
    } catch (error) {
      return { status: 'error' }
    }
  },
  syncGet: async () => {
    try {
      return await ipcRenderer.invoke('agrega:sync:get')
    } catch (error) {
      return { pin: '', payload: null, hash: '' }
    }
  },
})
