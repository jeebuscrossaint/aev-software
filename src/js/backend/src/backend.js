// Packages
import { SerialPort, DelimiterParser } from 'serialport';
import {Daemon, Listener} from 'node-gpsd';
import { WebSocketServer } from 'ws';
import fs from "fs";

class AEVBackend {
	constructor(config, logger) {
		this.logger = logger;
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

		this.wss = null;
	}

	start() {
		this.logger.warn("Logger initialized in backend!");
		this.initMCU();
		this.initGPS();
		this.initSocket();
	}

	initMCU() {
		// Initialize serial port for MCU
		if (fs.existsSync(this.config.MCU.path)) {
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
			this.ports.MCU.parser.on('data', (data) => {
				this.parseBMSData(data.toString().split("\n"));
			});
			this.ports.MCU.port.on('error', (error) => {
				// this.logger.warn(`MCU serial port error: ${error}`);
			});
			this.ports.MCU.port.on('close', () => {
				this.logger.warn("MCU serial port closed");
				this.continue.MCU = false;
			});
			this.ports.MCU.port.on('drain', () => {
				this.logger.success("MCU serial port drained (write failed)");
			});

			this.ports.MCU.port.open( (err) => {
				if (err) console.error(err)
			})

		} else {
			this.logger.fail("MCU serial port not found at " + this.config.MCU.path);
		}
	}

	initGPS() {
		// Initialize serial port for GPS
		if (fs.existsSync(this.config.GPS.path)) {
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
			this.ports.GPS.listener.on('TPV', (data) => {
				this.parseGPSData(data);
				// console.log(this.ports.GPS.data)
			});

		} else {
			this.logger.fail("GPS device not found at " + this.config.GPS.path);
		}
	}

	initSocket() {
		if (this.ports.MCU.enabled || this.ports.GPS.enabled) {
			// Initialize WebSocket server
			this.wss = new WebSocketServer({ 
				port: this.config.mainPort 
			});


			this.wss.on('connection', (ws) => {
				this.logger.success("Client connected to WebSocket server");
				if (this.ports.MCU.enabled) {
					if (this.ports.MCU.port.isOpen) {
						// Send BMS data to client half a second under a try-catch block
						setInterval(() => {
							try {
								if (this.continue.MCU) {
									this.ports.MCU.port.write("sh\n");
									// ws.send(JSON.stringify(this.ports.MCU.data));
									this.logger.debug("Updated BMS Data")
								} else {
									this.logger.warn("Told not to continue sending BMS data through socket");
								}
							} catch (error) {
								this.logger.warn("Error updating BMS data: " + error);
							}
						}, 500);
					}
				}

				ws.on('message', (message) => {
					message = message.toString();
					this.logger.debug("Received message from client: " + message);
					if (message === "bms-data") {  
						this.logger.success("Client requested BMS data, sending it over")
						ws.send(JSON.stringify(this.ports.MCU.data));
					} else if (message === "gps-data") {
						this.logger.success("Client requested GPS data, sending it over")
						ws.send(JSON.stringify(this.ports.GPS.data));
					} else if (message === "gps-restart") {
						this.initGPS();
					} else if (message === "bms-restart") {
						this.initMCU();
					} else {
						this.logger.warn("Unknown message received from client: " + `"${message}"`);
					}
				});
			});

			// this.wss.
		}
	}

	parseBMSData(data) {
		// Parse BMS data
		try {
			// Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "mcu> ")
			data.shift();
			data.shift();
			data.pop();
		
			// console.log("RAW SERIAL PORT DATA: \n\n" + data.join("\n"));
		
			// Split each element by the colon and trim the whitespace from the beginning and end
			data = data.map((element) => {
				return element.split(':').map((item) => {
					return item.trim();
				});
				
			});
			
			
			// Remove all instances of \r from the array
			data = data.map((element) => {
				return element.map((item) => {
					return item.replace(/\r/g, '');
				});
			});
			
			// Trim spaces in all of the keys
			data = data.map((element) => {
				return element.map((item) => {
					return item.replace(/\s/g, '');
				});
			});
			
			// console.log(data)
			
			// Alerts
			let alerts = [];
			let alertStartIndex = data.findIndex((element) => {
				return element[0] === "alerts";
			});
			let alertEndIndex = data.findIndex((element) => {
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
			
			
			
			const dataObj = {};
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
			// console.log(dataObj.cells);
			
			// console.log("\n\n");
			// this.logger.success("BMS Data: \n\n" + JSON.stringify(dataObj, null, 4));

			// this.logger.log(dataObj)

			this.ports.MCU.data = dataObj;
			return this.ports.MCU.data;
		} catch (error) {
			this.logger.warn("Error parsing BMS data: " + error);
			return this.ports.MCU.data;
		}
	}

	parseGPSData(data) {
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
}

export default AEVBackend;
