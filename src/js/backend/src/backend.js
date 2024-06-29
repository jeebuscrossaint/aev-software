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
			BMS: {
				enabled: false,
				port: null,
				parser: {
					main: null,
					overall: null,
					cells: null,
				},
				data: {
					voltage: "0v",
					cells: "0",
					cellList: {},
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
			BMS: true,
			GPS: true,
		}

		this.wss = null;
	}

	start() {
		this.logger.warn("Logger initialized in backend!");
		this.initBMS();
		this.initGPS();
		this.initSocket();
	}

	initBMS() {
		// Initialize serial port for BMS
		if (fs.existsSync(this.config.BMS.path)) {
			this.logger.success("BMS serial port is being opened...")
			this.ports.BMS.enabled = true;
			this.ports.BMS.port = new SerialPort({
				path: this.config.BMS.path,
				baudRate: this.config.BMS.baudRate,
				autoOpen: false, 
			});

			this.ports.BMS.parser.main = this.ports.BMS.port.pipe(new DelimiterParser({
				delimiter: 'mcu> split',
			}));

			// this.ports.BMS.parser.overall = this.ports.BMS.port.pipe(new DelimiterParser({
			// 	delimiter: 'show',
			// }));
			// this.ports.BMS.parser.cells = this.ports.BMS.port.pipe(new DelimiterParser({
			// 	delimiter: 'sh cells',
			// }));

			// console.log(this.logger)
			this.ports.BMS.port.on('open', () => {
				// const logger = this.logger;
				this.logger.success("BMS serial port opened");
				this.continue.BMS = true;
			});
			// this.ports.BMS.parser.overall.on('data', (data) => {
			// 	this.parseBMSData(data.toString().split("\n"));
			// });
			// this.ports.BMS.parser.cells.on('data', (data) => {
			// 	this.parseCellData(data.toString().split("\n"));
			// });

			this.ports.BMS.parser.main.on("data", (data) => {
				// let rawData = data;
				// // console.log(data.toString().split("\n"));
				// rawData = rawData.toString().split("show cells");
				// console.log(rawData)


				// const overall = rawData[0].split("\n");
				// const cells = rawData[1].split("\n");

				// console.log(data.toString());
				const rawData = data;
				// console.log(data.toString().split("\n"));
				console.log("RAW DATA\n\n" + data.toString().split("\n"));
				const parsedData = rawData.toString().split("sh\r")[1].split("mcu>");
				const overall = parsedData[0].split("\n");
				const cells = parsedData[1].split("\n");
				console.log("PARSED DATA\n\n" + parsedData);
				// console.log(parsedData)
				// console.log(overall);
				// console.log("\n");
				// console.log(cells);

				this.parseBMSData(overall);
				this.parseCellData(cells);

				this.logger.debug("Updated full BMS data");
			})
			
			this.ports.BMS.port.on('error', (error) => {
				// this.logger.warn(`BMS serial port error: ${error}`);
			});
			this.ports.BMS.port.on('close', () => {
				this.logger.warn("BMS serial port closed");
				this.continue.BMS = false;
			});
			this.ports.BMS.port.on('drain', () => {
				this.logger.success("BMS serial port drained (write failed)");
			});

			this.ports.BMS.port.open( (err) => {
				if (err) console.error(err)
			})

		} else {
			this.logger.fail("BMS serial port not found at " + this.config.BMS.path);
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

	stopBMS() {
		this.continue.BMS = false;
		this.ports.BMS.port.close();
		this.logger.warn("BMS serial port closed");
	}

	initSocket() {
		if (this.ports.BMS.enabled || this.ports.GPS.enabled) {
			// Initialize WebSocket server
			this.wss = new WebSocketServer({ 
				port: this.config.mainPort 
			});


			this.wss.on('connection', (ws) => {
				this.logger.success("Client connected to WebSocket server");
				if (this.ports.BMS.enabled) { 
					if (this.ports.BMS.port.isOpen) {

						this.ports.BMS.parser.debug = this.ports.BMS.port.pipe(new DelimiterParser({
							delimiter: "\n"
						}));
						this.ports.BMS.parser.debug.on("data", (data) => {
							console.log(data.toString());
						})

						// Send BMS data to client half a second under a try-catch block
						setInterval(() => {
							try {
								if (this.continue.BMS) {
									// this.ports.BMS.port.write("show\n");
									// ws.send(JSON.stringify(this.ports.BMS.data));
									// this.logger.debug("Updated BMS Data")
									// this.ports.BMS.port.write("show cells\n");
									// this.ports.BMS.port.write("split\n");

									setTimeout(() => {
										try {
											this.ports.BMS.port.write("\nsh\n");
											this.ports.BMS.port.drain();
										} catch (error) {
											console.log(error)
										}
										// this.ports.BMS.port.write("\nsh\n");
										// this.logger.log("Wrote show to MCU");
									}, 250);
								
									setTimeout(() => {
										try {
											this.ports.BMS.port.write("sh cells\n");
											this.ports.BMS.port.drain();
										} catch (error) {
											console.log(error)
										}
										// this.ports.BMS.port.write("sh cells\n");
										// this.logger.log("Wrote show cells to MCU");
									}, 500);
								
									setTimeout(() => {
										try {
											this.ports.BMS.port.write("split\n\n");
											this.ports.BMS.port.drain();
										} catch (error) {
											console.log(error)
										}
										// this.ports.BMS.port.write("split\n\n");
										// this.logger.log("Wrote split to MCU");
									}, 750);
									this.logger.debug("Wrote all commands, waiting for data response");
								} else {
									this.logger.warn("Told not to continue sending BMS data through socket");
								}
							} catch (error) {
								this.logger.warn("Error updating BMS data: " + error.toString());
								console.error(error);
							}
						}, 1000);

						// Get BMS cell data every 5 seconds
						// setInterval(() => {
						// 	try {
						// 		if (this.continue.BMS) {
						// 			this.ports.BMS.port.write("sh cells\n");
						// 			this.logger.debug("Updated BMS Cell Data")
						// 		} else {
						// 			this.logger.warn("Told not to continue sending BMS cell data through socket");
						// 		}
						// 	} catch (error) {
						// 		this.logger.warn("Error updating BMS cell data: " + error);
						// 	}
						// }, 5000);
					}
				}

				ws.on('message', (message) => {
					message = message.toString();
					let prefix = message;
					let reply;
					this.logger.debug("Received message from client: " + message);
					if (message === "bms-data") {  
						this.logger.success("Client requested BMS data, sending it over")
						reply = JSON.stringify(this.ports.BMS.data);
					// } else if (message === "cell-data") {
					// 	this.logger.success("Client requested cell data, sending it over")
					// 	reply = JSON.stringify(this.ports.BMS.data.cellList);
					} else if (message === "gps-data") {
						this.logger.success("Client requested GPS data, sending it over")
						reply = JSON.stringify(this.ports.GPS.data);
					} else if (message === "gps-restart") {
						try {
							this.initGPS();
							reply = "GPS restarted";
							this.logger.success("GPS restarted");
						} catch (error) {
							this.logger.warn("Error restarting GPS: " + error);
						}
					} else if (message === "bms-restart") {
						try {
							this.stopBMS();
							this.initBMS();
							reply = "BMS restarted";
							this.logger.success("BMS restarted");
						} catch (error) {
							this.logger.warn("Error restarting BMS: " + error);
						}
					} else {
						reply = "Unknown message"
						this.logger.warn("Unknown message received from client: " + `"${message}"`);
					}

					ws.send(`${prefix}|${reply}`);
				});
			});

			// this.wss.
		}

		this.wss.on('close', () => {
			this.logger.warn("Client disconnected from WebSocket server");
		});

		this.wss.on('error', (error) => {
			this.logger.warn("Error in WebSocket server: " + error);
		});

		this.logger.success("WebSocket server started on port " + this.config.mainPort);
	}

	parseBMSData(data) {
		// Parse BMS data
		try {
			// Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "BMS> ")
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

			this.ports.BMS.data = dataObj;
			return this.ports.BMS.data;
		} catch (error) {
			this.logger.warn("Error parsing BMS data: " + error);
			return this.ports.BMS.data;
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

	parseCellData(data) {
		// Remove first element and last elements in data array
		data.shift();
		data.pop();

		// console.log(data);

		let rawCells = [];

		data.forEach((cellData) => {
			let tmpCells = cellData.split(' c');

			for (let currentCell of tmpCells) {
				let cell = currentCell.split(' - ');
				if (cell[0] && cell[1]) {
					let cellNum = cell[0].trim();
					let cellVoltage = cell[1].trim();
		
					rawCells.push({
						num: cellNum,
						voltage: cellVoltage
					});
				}
			}
		});

		let cells = {};
		rawCells.forEach((cell) => {
			if (cell.voltage.includes("v")) {
				let voltage = `${cell.voltage.split("v")[0]}v`
				let alerts = cell.voltage.split("v")[1] ? cell.voltage.split("v")[1].trim() : null;
				cells[cell.num] = {
					voltage: voltage,
					alerts: alerts
				};
			} else {
				cells[cell.num] = {
					voltage: null,
					alerts: null
				};
			}
		});



		// console.log(JSON.stringify(cells, null, 2));
		// console.log(Object.keys(cells).forEach((key) => {
		// 	console.log(`${key}: ${cells[key].voltage}`);
		// }));

		this.ports.BMS.data.cellList = cells;
	}
}

export default AEVBackend;
