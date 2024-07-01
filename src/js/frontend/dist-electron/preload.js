const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functionalities to the renderer process
contextBridge.exposeInMainWorld('electron', {
  send: (channel) => {
    // List of channels you want to allow sending from the renderer process
    const validChannels = ['bms-data',"bms-restart","gps-data"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel);
    }
  },
  receive: (channel, callback) => {
    // List of channels you want to allow receiving in the renderer process
      // Remove any existing listeners to avoid duplicates
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, callback);

  }
});