import { app as n, BrowserWindow as r } from "electron";
import { spawn as a } from "child_process";
let d;
function s(o = "/", e, t) {
  new r({
    width: 1420,
    height: 900,
    title: e,
    icon: t,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    autoHideMenuBar: !0
  }).loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${o}`);
}
n.whenReady().then(() => {
  const o = a("node", ["../serialport/index.js"]);
  o.stdout.on("data", (e) => {
    console.log(`stdout: ${e}`);
  }), o.stderr.on("data", (e) => {
    console.error(`stderr: ${e}`);
  }), o.on("close", (e) => {
    console.log(`child process exited with code ${e}`);
  }), s("/", "main", "../assets/dashboard.ico"), s("/cameras", "cameras", "/cameras.ico");
});
n.on("window-all-closed", () => {
  d.kill(), n.quit();
});
