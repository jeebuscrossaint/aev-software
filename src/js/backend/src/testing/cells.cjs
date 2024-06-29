const CellsTestData = [
	'',
	' c1  - 2.995v        c13 - 2.995v        c25 - 2.989v       ',
	' c2  - 2.995v        c14 - 2.999v        c26 - 2.985v       ',
	' c3  - 2.998v        c15 - 2.996v        c27 - 2.988v       ',
	' c4  - 2.980v        c16 - 2.999v        c28 - 2.994v       ',
	' c5  - 2.994v        c17 - 2.994v        c29 - 2.998v       ',
	' c6  - 2.994v        c18 - 3.000v        c30 - 2.997v       ',
	' c7  - 2.997v        c19 - 2.969v        c31 - ------       ',
	' c8  - 2.975v        c20 - 2.987v        c32 - ------       ',
	' c9  - 2.990v        c21 - 2.985v        c33 - ------       ',
	' c10 - 2.996v        c22 - 2.984v        c34 - ------       ',
	' c11 - 2.994v        c23 - 2.984v        c35 - ------       ',
	' c12 - 3.232v ++     c24 - 2.987v        c36 - ------       ',
	'mcu> ',
	''
];

function parseCellData(data) {
	// Remove first element and last 2 elements in data array
	data.shift();
	data.pop();
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
	console.log(Object.keys(cells).forEach((key) => {
		console.log(`${key}: ${cells[key].voltage}`);
	}));
}

parseCellData(CellsTestData);