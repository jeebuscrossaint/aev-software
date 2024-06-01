import { app as e, BrowserWindow as i } from "electron";
function n(o = "/") {
  new i({
    width: 700,
    height: 900,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    autoHideMenuBar: !0,
    icon: "../public/favicon.ico"
  }).loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${o}`);
}
e.whenReady().then(() => {
  n("/"), n("/bms");
});
e.on("window-all-closed", () => {
  e.quit();
});
