// Packages
import { SerialPort, DelimiterParser } from 'serialport';
import { Daemon, Listener } from 'node-gpsd';
import { WebSocketServer } from 'ws';
import express from 'express';
import fs from 'fs';
import child_process from 'child_process';

class AEVBackend {
	constructor(config, logger) {
		this.logger = logger;
		this.config = config;
		this.ports = {
			BMS: {
				enabled: false,
				port: null,
				parser: null,
				data: {
					voltage: '0v',
					cells: '0',
					mean: '0v',
					stddev: '0v',
					alerts: [],
					current: '0A',
					SOC: '0%',
					uptime: [ '0', '0', '0' ],
				},
				debug: {
					parser: null,
					interval: false,
					waiting: false,
					noRes: 0,
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
				},
			},
		};

		this.continue = {
			BMS: true,
			GPS: true,
		};

		this.api = null;
		this.wss = null;
	}

	async start() {
		// this.logger.warn("Logger initialized in backend!");
		await this.initBMS();
		this.initGPS();
		this.initSocket();
		this.initAPI();
	}

	async initBMS() {
		// Initialize serial port for BMS
		if (fs.existsSync(this.config.BMS.path)) {
			this.continue.BMS = 2;
			this.logger.success('BMS serial port is being opened...');
			this.ports.BMS.enabled = true;
			this.ports.BMS.port = new SerialPort({
				path: this.config.BMS.path,
				baudRate: this.config.BMS.baudRate,
				autoOpen: false,
			});

			this.ports.BMS.parser = this.ports.BMS.port.pipe(new DelimiterParser({
				delimiter: 'sh',
			}));

			// console.log(this.logger)
			this.ports.BMS.port.on('open', () => {
				// const logger = this.logger;
				this.logger.success('BMS serial port opened');
				this.continue.BMS = 3;
				this.ports.BMS.debug.noRes = 0;

				// check tests/old-bms-init.js for old code

				if (!this.ports.BMS.debug.interval) {
					this.ports.BMS.debug.interval = true;
					this.ports.BMS.debug.waiting = false;

					setInterval(async () => {
						if (this.continue.BMS !== 3) {
							if (this.continue.BMS === 0 && !this.ports.BMS.port.isOpen) {
								this.logger.debug('BMS serial port is not open, restarting BMS');
								await this.initBMS();
							} else if (this.continue.BMS === 1 && this.ports.BMS.port.isOpen) {
								this.logger.debug('BMS serial port is closing, ignoring request');
							} else if (this.continue.BMS === 2) {
								this.logger.debug('BMS serial port is opening, ignoring request');
							} else {
								this.logger.debug('BMS serial port is in an unknown state, restarting BMS');
								await this.stopBMS();
								await this.initBMS();
							}
						} else if (this.continue.BMS === 3 && this.ports.BMS.port.isOpen) {
							if (this.ports.BMS.debug.noRes >= 3) {
								this.logger.warn('BMS serial port is not responding, putting it into an unknown state for restart');
								this.continue.BMS = -1;
							}

							this.ports.BMS.port.write('\nsh\n', (error) => {
								if (error) {
									this.logger.warn('BMS write failed: ' + error);
									this.ports.BMS.debug.noRes += 1;
								}
							});

							if (this.ports.BMS.debug.waiting) {
								this.ports.BMS.debug.noRes += 1;
								// if (this.ports.BMS.debug.noRes >= 3) {
								// 	this.logger.warn('BMS serial port is not responding, putting it into an unknown state for restart');
								// 	this.continue.BMS = -1;
								// }
							}
							this.logger.debug('Wrote all commands, waiting for data response');
							this.ports.BMS.debug.waiting = true;
						} else {
							this.continue.BMS = -1;
						}
					}, 500);
				}


			});
			this.ports.BMS.parser.on('data', (data) => {
				try {
					this.parseBMSData(data.toString().split('\n'));
				} catch {
					this.logger.warn('Error calling BMS data parser + ' + error);
				}

			});
			this.ports.BMS.port.on('error', (error) => {
				this.logger.warn(`BMS serial port error: ${error}`);
			});
			this.ports.BMS.port.on('close', () => {
				this.logger.warn('BMS serial port closed');
				this.continue.BMS = 0;
			});
			this.ports.BMS.port.on('drain', () => {
				this.logger.success('BMS serial port drained (write failed)');
			});

			this.ports.BMS.port.open((err) => {
				if (err) {
					this.logger.fail('Error opening BMS serial port: ' + err);
					// run "sudo fuser -k ${this.config.BMS.path}" asynchronously using os module
					child_process.exec(`sudo fuser -k ${this.config.BMS.path}`, (error, stdout, stderr) => {
						if (error) {
							this.logger.warn('Error killing BMS serial port process: ' + error);
						}
						if (stdout) {
							this.logger.success('Killed BMS serial port process: ' + stdout);
						}
						if (stderr) {
							this.logger.warn('Error killing BMS serial port process: ' + stderr);
						}
					});


					this.continue.BMS = 0;
				}
			});

		} else {
			this.logger.fail('BMS serial port not found at ' + this.config.BMS.path);
		}

		// if (this.ports.BMS.enabled) {
		// 	if (this.ports.BMS.port.isOpen) {

		// 	}
		// }
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
					error: console.error,
				},
			});

			this.ports.GPS.listener = new Listener({ // i doubt we need both the listener and the daemon but thats what docs say so..
				port: 2947,
				hostname: 'localhost',
				logger:  {
					info: function() {},
					warn: console.warn,
					error: console.error,
				},
				parse: true,
			});
			this.ports.GPS.daemon.start(() => {
				this.logger.success('GPS daemon started');
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
			this.logger.fail('GPS device not found at ' + this.config.GPS.path);
		}
	}

	stopGPS() {
		this.continue.GPS = false;
		this.ports.GPS.listener.disconnect();
		this.ports.GPS.daemon.stop();
		this.logger.warn('GPS daemon stopped');
	}

	async stopBMS() {
		this.continue.BMS = 1;
		await this.ports.BMS.port.close();
		// this.continue.BMS = 0;
		this.logger.warn('BMS serial port closed');
	}

	async initSocket() {
		if (this.ports.BMS.enabled || this.ports.GPS.enabled) {
			// Initialize WebSocket server
			this.wss = new WebSocketServer({
				port: this.config.mainPort,
			});


			this.wss.on('connection', (ws) => {
				this.logger.success('Client connected to WebSocket server');
				ws.on('message', async (message) => {
					message = message.toString();
					const prefix = message;
					let reply;
					this.logger.debug('Received message from client: ' + message);
					if (message === 'bms-data') {
						this.logger.success('Client requested BMS data, sending it over');
						reply = JSON.stringify(this.ports.BMS.data);
					} else if (message === 'gps-data') {
						this.logger.success('Client requested GPS data, sending it over');
						reply = JSON.stringify(this.ports.GPS.data);
					} else if (message === 'gps-restart') {
						try {
							this.initGPS();
							reply = 'GPS restarted';
							this.logger.success('GPS restarted');
						} catch (error) {
							this.logger.warn('Error restarting GPS: ' + error);
						}
					} else if (message === 'bms-restart') {
						try {
							await this.stopBMS();
							await this.initBMS();
							reply = 'BMS restarted';
							this.logger.success('BMS restarted');
						} catch (error) {
							this.logger.warn('Error restarting BMS: ' + error);
						}
					} else if (message === 'bms-debug') {
						ws.send('BMS debug mode enabled');
						const debugBMS = this.ports.BMS.port.pipe(new DelimiterParser({
							delimiter: '\n',
						}));
						debugBMS.on('data', (data) => {
							// console.log(data.toString());
							ws.send(data.toString());
						});


					} else {
						reply = 'Unknown message';
						this.logger.warn('Unknown message received from client: ' + `"${message}"`);
					}

					ws.send(`${prefix}|${reply}`);
				});
			});

			// this.wss.
		}
	}

	initAPI() {
		this.api = express();
		this.api.use(express.json());

		this.api.get('/', (req, res) => {
			this.logger.success('Recieved GET request on /, replied with API status');
			res.send({
				message: 'API server is running',
				ports: {
					BMS: this.ports.BMS.enabled,
					GPS: this.ports.GPS.enabled,
				},
			});
		});

		this.api.get('/bms', (req, res) => {
			this.logger.success('Recieved GET request on /bms, replied with BMS status: ' + this.ports.BMS.enabled);
			if (this.ports.GPS.enabled) {
				res.send({ enabled: true });
			} else {
				res.send({ enabled: false });
			}
		});
		this.api.get('/bms/data', (req, res) => {
			this.logger.success('Recieved GET request on /bms/data, replied with BMS data');
			res.send(JSON.stringify(this.ports.BMS.data));
		});
		this.api.get('/bms/restart', (req, res) => {
			try {
				this.logger.success('Recieved GET request on /bms/restart, restarting BMS');
				this.stopBMS();
				this.initBMS();
				res.send({ status: 'BMS restarted' });
			} catch (error) {
				res.send({ status: 'Error restarting BMS: ' + error });
			}
		});

		this.api.get('/gps', (req, res) => {
			this.logger.success('Recieved GET request on /gps, replied with GPS status: ' + this.ports.GPS.enabled);
			if (this.ports.GPS.enabled) {
				res.send({ enabled: true });
			} else {
				res.send({ enabled: false });
			}
		});
		this.api.get('/gps/data', (req, res) => {
			this.logger.success('Recieved GET request on /gps/data, replied with GPS data');
			res.send(JSON.stringify(this.ports.GPS.data));
		});
		this.api.get('/gps/restart', (req, res) => {
			try {
				this.logger.success('Recieved GET request on /gps/restart, restarting GPS');
				this.stopGPS();
				this.initGPS();
				res.send({ status: 'GPS restarted' });
			} catch (error) {
				res.send({ status: 'Error restarting GPS: ' + error });
			}
		});

		this.api.listen(3002, () => {
			this.logger.success('API server started on port', 3002);
		});
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
			const alerts = [];
			const alertStartIndex = data.findIndex((element) => {
				return element[0] === 'alerts';
			});
			const alertEndIndex = data.findIndex((element) => {
				return element[0] === 'current';
			});
			// alertEndIndex -= 1;
			// console.log(alertStartIndex, alertEndIndex);
			for (let i = alertStartIndex; i < alertEndIndex; i++) {
				if (data[i][1] !== '') {
					alerts.push(data[i][1]);
					// data
				}
			}
			// console.log(alerts);


			const dataObj = {};
			for (const item of data) {
				if (item[0] !== '') {
					dataObj[item[0]] = item[1];
				}
			}

			dataObj.alerts = alerts;

			// console.log(dataObj);

			// Trim all non-numbers from dataObj.uptime
			const oldUptime = dataObj.uptime.split('');
			const newUptime = [];
			for (let i = 0; i < oldUptime.length; i++) {
				if (isNaN(oldUptime[i])) {
					if (oldUptime[i].match(',')) {
						newUptime.push(oldUptime[i]);
					}
				} else {
					newUptime.push(oldUptime[i]);
				}
			}
			dataObj.uptime = newUptime.join('').split(',');

			// Trim all non-numbers from dataObj.cells
			const cellsRaw = dataObj.cells.split('');
			const cells = [];
			for (let i = 0; i < cellsRaw.length; i++) {
				if (!isNaN(cellsRaw[i])) {
					cells.push(cellsRaw[i]);
				}
			}
			dataObj.cells = cells.join('');
			// console.log(dataObj.cells);

			// console.log("\n\n");
			// this.logger.success("BMS Data: \n\n" + JSON.stringify(dataObj, null, 4));

			// this.logger.log(dataObj)


			const finalData = {
				voltage: dataObj.voltage,
				cells: dataObj.cells,
				mean: dataObj.mean,
				stddev: dataObj.stddev,
				alerts: dataObj.alerts,
				current: dataObj.current,
				SOC: dataObj.SOC,
				uptime: dataObj.uptime,
			};

			// console.log("Raw BMS data: \n\n" + JSON.stringify(data));
			console.log('Parsed BMS data: ' + JSON.stringify(finalData));
			this.ports.BMS.data = finalData;
			this.ports.BMS.debug.noRes = 0;
			this.logger.success('Parsed and updated BMS data');
			return this.ports.BMS.data;

		} catch (error) {
			this.logger.warn('Error parsing BMS data: ' + error);
			console.log(error);

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
}

export default AEVBackend;
