const { contextBridge, shell } = require('electron')

contextBridge.exposeInMainWorld('agrega', {
  ping: () => 'ready',
  openExternal: (url) => {
    if (!url) return
    shell.openExternal(url)
  },
})
