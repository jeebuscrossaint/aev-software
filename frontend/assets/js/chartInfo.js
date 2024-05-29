let voltage = {
    labels: [ '1s', '', '0.5s', '', 'Now'],
    datasets: [
        {
            label: 'Per Cell',
            backgroundColor: '#4D6CAF',
            borderColor: '#4D6CAF',
            color: '#ffffff',
            fill: {
                target: 'origin',
                above: 'rgba(127, 159, 229,0.8)',   // Area will be red above the origin
            },
            tension: 0.1,
            pointStyle: false,
            capBezierPoints: false,
            borderCapStyle: 'round',
            cubicInterpolationMode: 'monotone',
            data: [0, 0, 0, 0, 0],
        },
        {
            label: 'Overall',
            backgroundColor: '#f87979',
            borderColor: '#f87979',
            color: '#ffffff',
            fill: {
                target: 'origin',
                above: 'rgba(255, 0, 0,0.3)',   // Area will be red above the origin
            },
            tension: 0.1,
            pointStyle: false,
            borderCapStyle: 'round',
            cubicInterpolationMode: 'monotone',
            data: [0, 0, 0, 0, 0],
        },
    ]
};

export function getVoltage(newData){
    voltage.datasets[0].data = newData;
    return voltage;
}


export const voltageChart = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: true,
            reverse: true,
            labels: {
                useBorderRadius: true,
                borderRadius: 5
            }
        },
        tooltip: {
            enabled: false
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'black',
                padding: 8
            },
            grid: {
                drawTicks: false
            }
        },
        y: {
            ticks: {
                color: 'black', 
                padding: 8
            },
            grid: {
                drawTicks: false,
            }
        }
    },
    aspectRatio: 1/1,
}

let current = {
    labels: [ '1s', '', '', '', '0.5s', '', '', '', 'Now'],
    datasets: [
      {
        label: 'Voltage',
        backgroundColor: 'rgb(0,0,128)',
        borderColor: '#f87979',
        color: '#ffffff',
        fill: {
            target: 'origin',
            above: 'rgba(255, 0, 0,0.3)',   // Area will be red above the origin
            below: 'rgba(127, 159, 229,0.8)'
        },
        tension: 0.1,
        pointStyle: false,
        borderCapStyle: 'round',
        cubicInterpolationMode: 'monotone',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ]
};

export function getCurrent(newData){
    current.datasets[0].data = newData;
    return current;
}

export const currentChart = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false
        },
    },
    scales: {
        x: {
            ticks: {
                color: 'black',
                padding: 6
            },
            grid: {
                drawTicks: false
            }
        },
        y: {
            ticks: {
                color: 'black', 
                padding: 6
            },
            grid: {
                drawTicks: false,
            }
        }
    },
    aspectRatio: 1/1,
}
