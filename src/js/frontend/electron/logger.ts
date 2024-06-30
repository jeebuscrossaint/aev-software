// Original logger code from RealStr1ke/Byte

import colors from 'colors';


class Logger {

	constructor() {
		this.startup("Logger initialized!");
	}

	log(message: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)} ${message}`);
		return true;
	}

	success(message: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' ✓ ')} ${message}`);
		return true;
	}

	debug(info: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgCyan.white(' ! ')} ${info}`);
	}

	warn(info: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgYellow.white(' ⚠ ')} ${info}`);
	}

	fail(message: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgRed.white(' ✘ ')} ${message}`);
		return true;
	}

	startup(message: any) {
		// console.log(`${colors.bgGray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' 🟢 ')} ${message}`);
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgGreen.white(' ✅ ')} ${message}`);
		return true;
	}

	shutdown(message: any) {
		console.log(`${colors.gray(` ${new Date().toLocaleTimeString()} `)}${colors.bgRed.white(' 🔴 ')} ${message}`);
		return true;
	}
}

export default Logger
