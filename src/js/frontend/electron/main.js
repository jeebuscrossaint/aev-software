"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var backend_1 = require("./backend");
function createWindow(route, title, icon) {
    if (route === void 0) { route = '/'; }
    var win = new electron_1.BrowserWindow({
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
    win.loadURL("".concat(process.env.VITE_DEV_SERVER_URL, "/#").concat(route));
    return win;
}
electron_1.app.whenReady().then(function () {
    var config = {
        MCU: {
            path: "/dev/ttyUSB0",
            baudRate: 115200,
        },
        GPS: {
            path: "/dev/ttyAMA0"
        }
    };
    var dashboard = createWindow('/', 'main', '../assets/dashboard.ico');
    var cameras = createWindow('/cameras', 'cameras', '/cameras.ico');
    var backend = new backend_1.default(config, console);
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
