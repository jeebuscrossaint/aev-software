import WebSocket from "ws";
import Logger from "./src/logger.cjs";
const logger = new Logger();
const ws = new WebSocket("ws://localhost:3001");

ws.on("error", console.error);

ws.on("open", function open() {
	setInterval(() => {
		ws.send("gps-data");
		logger.log("Requested GPS data from server")
	}, 500);
});

ws.on("message", function message(data) {
	logger.log("Recieved " + data)
});
