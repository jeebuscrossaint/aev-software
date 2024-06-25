let data = [
    '    voltage : 89.98v\r',
    '    cells   : 30 (not locked)\r',
    '    mean    : 3.000v\r',
    '    std dev : 0.045v\r',
    '  alerts    : alert #1\r',
    '            : alert #2\r',
    '            : alert #3\r',
    '  current   : -0.2A\r',
    '  SOC       : 47%\r',
    '  uptime: 0 hour(s), 0 minute(s), 49 second(s)\r'
];

console.log("RAW SERIAL PORT DATA: \n\n" + data.join("\n"));

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
		data
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

console.log("\n\n");
console.log("PARSED SERIAL PORT DATA: \n\n" + JSON.stringify(dataObj, null, 4));
