import { app as t, BrowserWindow as r } from "electron";
import { spawn as s } from "child_process";
let i;
function n(o = "/") {
  new r({
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
t.whenReady().then(() => {
  const o = s("node", ["../serialport/index.js"]);
  o.stdout.on("data", (e) => {
    console.log(`stdout: ${e}`);
  }), o.stderr.on("data", (e) => {
    console.error(`stderr: ${e}`);
  }), o.on("close", (e) => {
    console.log(`child process exited with code ${e}`);
  }), n("/"), n("/bms"), n("/camera");
});
t.on("window-all-closed", () => {
  i.kill(), t.quit();
});
