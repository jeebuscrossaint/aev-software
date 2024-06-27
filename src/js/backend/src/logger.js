// Original logger code from RealStr1ke/Byte

import colors from 'colors';
class Logger {

	constructor() {
		this.startup("Logger initialized!");
	}

	log(message) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)} ${message}`);
		return true;
	}

	success(message) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' ✓ ')} ${message}`);
		return true;
	}

	debug(info) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgBrightYellow.white(' ! ')} ${info}`);
	}

	warn(info) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgYellow.white(' ⚠ ')} ${info}`);
	}

	fail(message) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgRed.white(' ✘ ')} ${message}`);
		return true;
	}

	startup(message) {
		// console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' 🟢 ')} ${message}`);
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' ✅ ')} ${message}`);
		return true;
	}

	shutdown(message) {
		console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgRed.white(' 🔴 ')} ${message}`);
		return true;
	}
}

module.exports = CustomLog;