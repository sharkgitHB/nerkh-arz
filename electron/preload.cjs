// Electron preload script - secure bridge for the renderer
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  // Auto-update messages from the main process: {type, version?, percent?}
  onUpdateMessage: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("update:message", handler);
    return () => ipcRenderer.removeListener("update:message", handler);
  },
  // Quit and install a downloaded update
  installUpdate: () => ipcRenderer.invoke("update:install"),
  // Floating widget window (desktop only)
  toggleWidget: () => ipcRenderer.invoke("widget:toggle"),
  onWidgetClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("widget:closed", handler);
    return () => ipcRenderer.removeListener("widget:closed", handler);
  },
});
