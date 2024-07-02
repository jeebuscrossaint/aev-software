// Import AGS
import { App, Utils } from './modules/utils/imports.js';

// Modules
import AppLauncher from './modules/applauncher/applauncher.js';
import TopBar from './modules/bar/top/bar.js';
import BottomBar from './modules/bar/bottom/bar.js';

// SCSS Setup
import SCSS from './modules/utils/scss.js';
SCSS();

// Kill all other notification daemons
import { killOtherNotifDaemons } from './modules/utils/utils.js';
killOtherNotifDaemons();

// SCSS Watcher
Utils.subprocess([
	'inotifywait',
	'--recursive',
	'--event', 'create,modify,move,delete',
	'-m', App.configDir + '/assets/styles',
], () => SCSS());

// Main Export
export default {
	windows: [
		TopBar({ monitor: 0 }),
		AppLauncher(),
		BottomBar({ monitor: 0 }),
	],
};
