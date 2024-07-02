import { app as e, BrowserWindow as i } from 'electron';
let r;
function a(o = '/', t, n) {
	new i({
		width: 1420,
		height: 900,
		title: t,
		icon: n,
		webPreferences: {
			nodeIntegration: !0,
			contextIsolation: !1,
		},
		autoHideMenuBar: !0,
	}).loadURL(`http://localhost:5151/#${o}`);
}
e.whenReady().then(() => {
	a('/', 'main', '../assets/dashboard.ico'), a('/cameras', 'cameras', '/cameras.ico');
});
e.on('window-all-closed', () => {
	r.kill(), e.quit();
});
