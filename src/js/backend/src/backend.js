// Packages
import { SerialPort, DelimiterParser } from 'serialport';
import ws from 'ws';

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
			},
		};

		this.continue = {
			MCU: true,
			GPS: true,
		}

		this.wss = null;
	}

	start() {
		this.initPorts();
		this.initSocket();
	}

	initPorts() {
		// Initialize serial port for MCU
		if (fs.existsSync('/dev/ttyUSB0')) {
			this.ports.MCU.enabled = true;
			this.ports.MCU.port = new SerialPort({
				path: this.config.MCU.path,
				baudRate: this.config.MCU.baudRate,
			});

			this.ports.MCU.parser = this.ports.MCU.port.pipe(new DelimiterParser({
				delimiter: 'sh',
			}));

			this.ports.MCU.port.on('open', function() {
				this.logger.success("MCU serial port opened");
				this.continue.MCU = true;
			});
			this.ports.MCU.parser.on('data', function(data) {
				this.parseBMSData(data);
			});
			this.ports.MCU.port.on('error', function(error) {
				this.logger.warn("MCU serial port error: " + error);
			});
			this.ports.MCU.port.on('close', function() {
				this.logger.warn("MCU serial port closed");
				this.continue.MCU = false;
			});
			this.ports.MCU.port.on('drain', function() {
				this.logger.success("MCU serial port drained (write failed)");
			});

		} else {
			this.logger.error("MCU serial port not found at " + this.config.MCU.path);
		}

		// Initialize serial port for GPS
		// NOTE: Not yet implemented
	}

	initSocket() {
		if (this.ports.MCU.enabled || this.ports.GPS.enabled) {
			// Initialize WebSocket server
			this.wss = new ws.Server({ 
				port: this.config.mainPort 
			});


			wss.on('connection', function connection(ws) {
				this.logger.success("Client connected to WebSocket server");
				if (this.ports.MCU.enabled) {
					if (this.ports.MCU.port.isOpen) {
						// Send BMS data to client half a second under a try-catch block
						setInterval(() => {
							try {
								if (this.continue.MCU) {
									this.logger.log("Sending BMS data to client")
									ws.send(JSON.stringify(this.ports.MCU.data));
								} else {
									this.logger.warn("Told not to continue sending BMS data through socket");
								}
								
							} catch (error) {
								this.logger.warn("Error sending BMS data to client: " + error);
							}
						}, 500);
					}
				}

				ws.on('message', function incoming(message) {
					if (message === "bms-data") {
						this.logger.log("Client requested BMS data, sending it over")
						ws.send(JSON.stringify(this.ports.MCU.data));
					} else if (message === "gps-data") {
						// NOTE: Not yet implemented
					} else {
						this.logger.warn("Unknown message received from client: " + message);
					}
				});
			});
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
			this.logger.success("BMS Data: \n\n" + JSON.stringify(dataObj, null, 4));

			this.ports.MCU.data = dataObj;
			return this.ports.MCU.data;
		} catch (error) {
			this.logger.warn("Error parsing BMS data: " + error);
			return this.ports.MCU.data;
		}
	}
}

export default AEVBackend;