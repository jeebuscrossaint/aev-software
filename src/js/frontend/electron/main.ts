const { app, BrowserWindow, ipcMain } = require('electron')
const { SerialPort, DelimiterParser } = require('serialport');
const { existsSync } = require('fs');
const { Daemon, Listener } = require('node-gpsd');
const {Logger} = require('./logger.cjs');
const path = require('path')

interface Config {
	MCU: {
		path: string,
		baudRate: number,
	}
	GPS: {
		path: string,
	}
}

function createWindow(route = '/', title: string, icon: any) { //creates electron windows
  let win = new BrowserWindow({
    width: 1420,
    height: 900,
    title: title,
    icon: icon,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js")
    },
    autoHideMenuBar: true
  });
  console.log(win)
  // win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
  win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${route}`);
  return win;  
}



app.whenReady().then(() => {
  let config: Config = {
    MCU: {
      path: "/dev/ttyUSB0",
      baudRate: 115200,
    },
    GPS: {
      path: "/dev/ttyAMA0"
    }
  }

  let dashboard = createWindow('/', 'main', '../assets/dashboard.ico');
  let cameras = createWindow('/cameras', 'cameras', '/cameras.ico');
  let backend = new AEVBackend(config, Logger);
  backend.callback = (event: string, data: any) => {
    dashboard.webContents.send(event, data);
  }
  ipcMain.on('gps-data', () => {
    backend.sendMessage('gps-data');
  })
  ipcMain.on('bms-data', () => {
    backend.sendMessage('bms-data');
  })
  ipcMain.on('bms-restart', () => {
    backend.sendMessage('bms-restart');
  })
  backend.start();

});
app.on('window-all-closed', () => {
  app.quit();
});

interface Config {
	MCU: {
		path: string,
		baudRate: number,
	}
	GPS: {
		path: string,
	}
}

interface Ports {
	MCU: {
		enabled: boolean,
		port: typeof SerialPort | null,
		parser: typeof DelimiterParser | null,
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
		daemon: typeof Daemon | null,
		listener: typeof Listener | null,
		data: {
			speed: number,
			lon: number,
			lat: number,
		}
	}
}

class AEVBackend {
	private logger: any;
	private config: Config;
	private ports: Ports;
	public callback: Function;
	private continue: {
		MCU: boolean,
		GPS: boolean,
	}

	constructor(config: Config, logger: any) {
		this.logger = new logger();
		this.config = config;
		this.ports = {
			MCU: {
				enabled: false,
				port: null,
				parser: null,
				data: {
					voltage: "0v",
					cells: "0",
					mean: "0v",
					stddev: "0v",
					alerts: [],
					current: "0A",
					SOC: "0%",
					uptime: [ "0", "0", "0" ],
				},
			},
			GPS: {
				enabled: false,
				daemon: null,
				listener: null,
				data: {
					speed: 0,
					lon: 0,
					lat: 0,
				}
			},
		};

		this.continue = {
			MCU: true,
			GPS: true,
		}
		this.callback = () => {console.log('callback not set')}
	}

	start() {
		this.logger.warn("Logger initialized in backend!");
		this.initMCU();
		this.initGPS();
		//this.initSocket();
	}

	async initMCU() {
		// Initialize serial port for MCU
		if (existsSync(this.config.MCU.path)) {
			this.logger.success("MCU serial port is being opened...")
			this.ports.MCU.enabled = true;
			
			this.ports.MCU.port = new SerialPort({
				path: this.config.MCU.path,
				baudRate: this.config.MCU.baudRate,
				autoOpen: false, 
			});

			this.ports.MCU.parser = this.ports.MCU.port.pipe(new DelimiterParser({
				delimiter: 'sh',
			}));

			// console.log(this.logger)
			this.ports.MCU.port.on('open', () => {
				// const logger = this.logger;
				this.logger.success("MCU serial port opened");
				this.continue.MCU = true;
			});
			this.ports.MCU.parser.on('data', (data: any) => {
				this.parseBMSData(data.toString().split("\n"));
			});
			this.ports.MCU.port.on('error', (error: any) => {
				// this.logger.warn(`MCU serial port error: ${error}`);
			});
			this.ports.MCU.port.on('close', () => {
				this.logger.warn("MCU serial port closed");
				this.continue.MCU = false;
			});
			this.ports.MCU.port.on('drain', () => {
				this.logger.success("MCU serial port drained (write failed)");
			});

			this.ports.MCU.port.open( (err: any) => {
				if (err) console.error(err)
			})

		} else {
			this.logger.fail("MCU serial port not found at " + this.config.MCU.path);
		}
	
	}

	initGPS() {
		// Initialize serial port for GPS
		if (existsSync(this.config.GPS.path)) {
			this.ports.GPS.enabled = true; // this should also depend on gpsd running
			this.ports.GPS.daemon = new Daemon({
				program: 'gpsd',
				device: this.config.GPS.path,
				port: 2947, // Default port for gpsd, usually shouldn't be changed
				pid: '/tmp/gpsd.pid',
				readOnly: false,
				logger: {
					info: function() {},
					warn: console.warn,
					error: console.error
				}
			});
			
			this.ports.GPS.listener = new Listener({ // i doubt we need both the listener and the daemon but thats what docs say so..
				port: 2947,
				hostname: 'localhost',
				logger:  {
					info: function() {},
					warn: console.warn,
					error: console.error
				},
				parse: true
			});
			this.ports.GPS.daemon.start(() => {
				this.logger.success("GPS daemon started");
			});
			this.ports.GPS.listener.connect(() => {
				this.logger.success('Connected to gpsd');
				this.ports.GPS.listener.watch();
			});
			this.ports.GPS.listener.on('TPV', (data: any) => {
				this.parseGPSData(data);
				// console.log(this.ports.GPS.data)
			});

		} else {
			this.logger.fail("GPS device not found at " + this.config.GPS.path);
		}
	}

	stopMCU() {
		this.continue.MCU = false;
		this.ports.MCU.port?.close();
		this.logger.warn("MCU serial port closed");
	}

	parseBMSData(data: any) {
		// Parse BMS data
		try {
			// Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "mcu> ")
			data.shift();
			data.shift();
			data.pop();
		
			// console.log("RAW SERIAL PORT DATA: \n\n" + data.join("\n"));
		
			// Split each element by the colon and trim the whitespace from the beginning and end
			data = data.map((element: any) => {
				return element.split(':').map((item: any ) => {
					return item.trim();
				});
				
			});
		// who even uses type checking fr
			
			// Remove all instances of \r from the array
			data = data.map((element: any) => {
				return element.map((item: any) => {
					return item.replace(/\r/g, '');
				});
			});
			
			// Trim spaces in all of the keys
			data = data.map((element: any) => {
				return element.map((item: any) => {
					return item.replace(/\s/g, '');
				});
			});
			
			// console.log(data)
			
			// Alerts
			let alerts = [];
			let alertStartIndex = data.findIndex((element: string[]) => {
				return element[0] === "alerts";
			});
			let alertEndIndex = data.findIndex((element: string[]) => {
				return element[0] === "current";
			});
			// alertEndIndex -= 1;
			// console.log(alertStartIndex, alertEndIndex);
			for (let i = alertStartIndex; i < alertEndIndex; i++) {
				if (data[i][1] !== "") {
					alerts.push(data[i][1]);
					// data
				}
			}
			// console.log(alerts);
			
			
			
			let dataObj: any = {};
			for (let item of data) {
				if (item[0] !== "") {
					dataObj[item[0]] = item[1];
				}
			}
			
			dataObj.alerts = alerts;
	
			// console.log(dataObj);
			
			// Trim all non-numbers from dataObj.uptime
			let oldUptime = dataObj.uptime.split("");
			let newUptime = [];
			for (let i = 0; i < oldUptime.length; i++) {
				if (isNaN(oldUptime[i])) {
					if (oldUptime[i].match(",")) {
						newUptime.push(oldUptime[i]);
					}
				} else {
					newUptime.push(oldUptime[i]);
				}
			}               
			dataObj.uptime = newUptime.join("").split(",");
			
			// Trim all non-numbers from dataObj.cells
			let cellsRaw = dataObj.cells.split("");
			let cells = [];
			for (let i = 0; i < cellsRaw.length; i++) {
				if (!isNaN(cellsRaw[i])) {
					cells.push(cellsRaw[i]);
				}
			}
			dataObj.cells = cells.join("");

			this.ports.MCU.data = dataObj;
			return this.ports.MCU.data;
		} catch (error) {
			this.logger.warn("Error parsing BMS data: " + error);
			return this.ports.MCU.data;
		}
	}

	parseGPSData(data: any) {
		if (data.speed) {
			this.ports.GPS.data.speed = data.speed;
		}
		if (data.lon) {
			this.ports.GPS.data.lon = data.lon;
		}
		if (data.lat) {
			this.ports.GPS.data.lat = data.lat;
		}

		return this.ports.GPS.data;
	}
	sendMessage(event: string) {
		if(event == "bms-restart") {
			this.stopMCU();
			this.initMCU();
		}
		else if (event == "bms-data") {
			this.callback(event, this.ports.MCU.data);
		}
		else if (event == "gps-data") {
			this.callback(event, this.ports.GPS.data);
		}
	}
}