import WebSocket from "ws";
import Logger from "./src/logger.cjs";
const logger = new Logger();
const ws = new WebSocket("ws://localhost:3001");

ws.on("error", console.error);

ws.on("open", function open() {
	// every sec, send "bms-data" to server
	setInterval(() => {
		ws.send("bms-data");
		logger.log("Requested BMS data from server")
	}, 500);
});

ws.on("message", function message(data) {
	console.log("recieved %s", data)
});

// import { SerialPort, DelimiterParser } from "serialport";

// console.log(await SerialPort.list())

// let port = new SerialPort({
// 	path: "/dev/ttyUSB0",
// 	baudRate: 115200,
// 	// autoOpen: false,
// });

// const port = new SerialPort({
//     path: '/dev/ttyUSB0',
//     baudRate: 115200,
// });
// const parser = port.pipe(new DelimiterParser({
//     delimiter: 'sh'
// }));

// let parser = port.pipe(new DelimiterParser({
// 	delimiter: 'sh',
// }));

// port.on('open', function() {
// 	logger.success("MCU serial port opened");
// 	// this.continue.MCU = true;
// });
// parser.on('data', function(data) {
// 	// this.parseBMSData(data);

// 	console.log(data)
// });
// port.on('error', function(error) {
// 	logger.warn(`MCU serial port error: ${error}`);
// });
// port.on('close', function() {
// 	logger.warn("MCU serial port closed");
// 	// this.continue.MCU = false;
// });
// port.on('drain', function() {
// 	logger.success("MCU serial port drained (write failed)");
// });

// port.open(function (err) {
// 	if (err) console.error(err)
// });