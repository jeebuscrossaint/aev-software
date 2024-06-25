import { app as e, BrowserWindow as i } from "electron";
let r;
function a(n = "/", o, t) {
  new i({
    width: 1420,
    height: 900,
    title: o,
    icon: t,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    autoHideMenuBar: !0
  }).loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${n}`);
}
e.whenReady().then(() => {
  a("/", "main", "../assets/dashboard.ico"), a("/cameras", "cameras", "/cameras.ico");
});
e.on("window-all-closed", () => {
  r.kill(), e.quit();
});
