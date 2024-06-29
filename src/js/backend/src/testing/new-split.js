import { SerialPort, DelimiterParser } from 'serialport';

const port = new SerialPort({ 
	path: "/dev/ttyUSB0",
	baudRate: 115200 
});

const parser = port.pipe(new DelimiterParser({ 
	delimiter: 'mcu> split' 
}));

const consolePipe = port.pipe(new DelimiterParser({
	delimiter: "\n"
}));
consolePipe.on("data", (data) => {
	console.log(data.toString());
})

parser.on('data', (data) => {
	// console.log(data.toString());
	const rawData = data;
	// console.log(data.toString().split("\n"));
	const parsedData = rawData.toString().split("sh\r")[1].split("mcu>");
	// console.log(parsedData);
	const overall = parsedData[0].split("\n");
	const cells = parsedData[1].split("\n");
	// console.log(parsedData)
	// console.log(overall);
	// console.log("\n");
	// console.log(cells);
});

port.on("open", () => {
	console.log("Port opened!");
	// port.write("bms\n")
	// Wait for 1 second, then write "show" to MCU, 
	// then wait for 1 second and write "show cells" again,
	// then wait for 1 second and write "split" again

	setInterval(() => {
		try {
			setTimeout(() => {
				try {
					port.write("\nsh\n");
					port.drain();
				} catch (error) {
					console.log(error)
				}
				// console.log("Wrote show to MCU");
			}, 250);

			setTimeout(() => {
				try {
					port.write("sh cells\n");
					port.drain();
				} catch (error) {
					console.log(error)
				}
				// console.log("Wrote show cells to MCU");
			}, 500);

			setTimeout(() => {
				try {
					port.write("split\n");
					port.drain();
				} catch (error) {
					console.log(error)
				}
				// console.log("Wrote split to MCU");
			}, 750);

		} catch (error) {
			console.log(error);
		}
	}, 1000);
});