const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  onServerStatus: (callback) =>
    ipcRenderer.on("server-status-message", (event, message) =>
      callback(message)
    ),
});
