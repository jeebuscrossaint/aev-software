import { SerialPort, DelimiterParser } from 'serialport';
import {Daemon, Listener} from 'node-gpsd';
export interface Config {
	MCU: {
		path: string,
		baudRate: number,
	}
	GPS: {
		path: string,
	}
}

export interface Ports {
	MCU: {
		enabled: boolean,
		port: SerialPort | null,
		parser: DelimiterParser | null,
		data: {
			voltage: string,
			cells: string,
			mean: string,
			stddev: string,
			alerts: string[],
			current: string,
			SOC: string,
			uptime: string[],
		}
	}
	GPS: {
		enabled: boolean,
		daemon: Daemon | null,
		listener: Listener | null,
		data: {
			speed: number,
			lon: number,
			lat: number,
		}
	}
}
