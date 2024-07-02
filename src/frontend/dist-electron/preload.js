const { contextBridge, ipcRenderer } = require('electron');
const { exec } = require('child_process');
contextBridge.exposeInMainWorld('electron', {
    switch_workspace: (workspace) => ipcRenderer.invoke('exec', 'hyprctl dispatch workspace ' + workspace),
   // exec: (command, callback) => ipcRenderer.invoke('exec', command).then(result => callback(result))
});