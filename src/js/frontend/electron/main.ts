import { app, BrowserWindow, ipcMain } from 'electron'
import {Config, Ports} from './types';
import AEVBackend from './cjs_modules/backend';

function createWindow(route = '/', title: string, icon: any) { //creates electron windows
  let win = new BrowserWindow({
    width: 1420,
    height: 900,
    title: title,
    icon: icon,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
    autoHideMenuBar: true
  });
  
  // win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
  win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${route}`);
  return win;  
}


app.whenReady().then(() => {
  let config: Config = {
    MCU: {
      path: "/dev/ttyUSB0",
      baudRate: 115200,
    },
    GPS: {
      path: "/dev/ttyAMA0"
    }
  }

  let dashboard = createWindow('/', 'main', '../assets/dashboard.ico');
  let cameras = createWindow('/cameras', 'cameras', '/cameras.ico');
  let backend = new AEVBackend(config, console);
  backend.callback = (event: string, data: any) => {
    dashboard.webContents.send(event, data);
  }
  ipcMain.on('gps-data', () => {
    backend.sendMessage('gps-data');
  })
  ipcMain.on('bms-data', () => {
    backend.sendMessage('bms-data');
  })
  ipcMain.on('bms-restart', () => {
    backend.sendMessage('bms-restart');
  })
  backend.start();

});
app.on('window-all-closed', () => {
  app.quit();
});
