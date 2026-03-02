import { contextBridge, shell } from 'electron'

contextBridge.exposeInMainWorld('agrega', {
  ping: () => 'ready',
  openExternal: (url) => {
    if (!url) return
    shell.openExternal(url)
  },
})
