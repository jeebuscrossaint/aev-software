/** *********VOLTAGE***********/

const voltage = {
	labels: [ '2s', '', '', '', '1s', '', '', '', 'Now'],
	datasets: [
		{
			label: 'Per Cell',
			backgroundColor: '#4D6CAF',
			borderColor: '#4D6CAF',
			color: '#ffffff',
			fill: {
				target: 'origin',
				above: 'rgba(127, 159, 229,0.8)',
			},
			tension: 0.1,
			pointStyle: false,
			capBezierPoints: false,
			borderCapStyle: 'round',
			cubicInterpolationMode: 'monotone',
			data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
		},
		{
			label: 'Overall',
			backgroundColor: '#f87979',
			borderColor: '#f87979',
			color: '#ffffff',
			fill: {
				target: 'origin',
				above: 'rgba(255, 0, 0,0.3)',
			},
			tension: 0.1,
			pointStyle: false,
			borderCapStyle: 'round',
			cubicInterpolationMode: 'monotone',
			data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
		},
	],
};

export const voltageChart = {
	responsive: false,
	maintainAspectRatio: true,
	animation: false,
	plugins: {
		legend: {
			display: true,
			reverse: true,
			labels: {
				useBorderRadius: true,
				borderRadius: 5,
			},
		},
		tooltip: {
			enabled: false,
		},
	},
	scales: {
		x: {
			ticks: {
				color: 'black',
				padding: 3,
			},
			grid: {
				drawTicks: false,
			},
		},
		y: {
			ticks: {
				color: 'black',
				padding: 3,
			},
			grid: {
				drawTicks: false,
			},
			max: 120,
			min: 0,
		},
	},
	aspectRatio: 1 / 1,
};

export function getVoltage(newData) {
	voltage.datasets[0].data = newData;
	return voltage;
}

/** *********CURRENT***********/

const current = {
	labels: [ '2s', '', '', '', '1s', '', '', '', 'Now'],
	datasets: [
		{
			label: 'Voltage',
			backgroundColor: 'rgb(0,0,128)',
			borderColor: '#4D6CAF',
			color: '#ffffff',
			fill: {
				target: 'origin',
				above: 'rgba(255, 0, 0,0.3)',
				below: 'rgba(0, 255, 0,0.3)',
			},
			tension: 0.1,
			pointStyle: false,
			borderCapStyle: 'round',
			cubicInterpolationMode: 'monotone',
			data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
		},
	],
};

export const currentChart = {
	responsive: false,
	maintainAspectRatio: true,
	animation: false,
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			enabled: false,
		},
	},
	scales: {
		x: {
			ticks: {
				color: 'black',
				padding: 6,
			},
			grid: {
				drawTicks: false,
			},
		},
		y: {
			ticks: {
				color: 'black',
				padding: 6,
			},
			grid: {
				drawTicks: false,
			},
			max: 30,
			min: -30,
		},
	},
	aspectRatio: 1 / 1,
};

export function getCurrent(newData) {
	current.datasets[0].data = newData;
	return current;
}

/** *********BATTERY***********/

const battery = {
	labels: ['Good', 'Warning', 'Charge'],
	datasets: [
		{
			label: 'Charge',
			data: [0, 0, 100],
			backgroundColor: ['Orange', 'Gray'],
			cutout: '70%',
		},
		{
			label: 'Charge',
			data: [0.81, 2.45, 4.9],
			backgroundColor: ['Red', 'Orange', 'Green'],
			cutout: '80%',
		},
	],
};

export const batteryChart = {
	rotation: 260,
	circumference: 200,
	responsive: false,
	animation: false,
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			enabled: false,
		},
	},
};

export function getBattery(newData) {
	battery.datasets[0].data = newData;
	return battery;
}
