import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { Server } from 'socket.io';
import {createServer} from 'http';
import express from 'express';
import cors from 'cors';
import {Daemon, Listener} from 'node-gpsd';
import child_process from 'node:child_process';
function BmsData(data) {
    // console.log(data); process.exit();
    // Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "mcu> ")
    data.shift();
    data.shift();
    data.pop();

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

    console.log(dataObj);
    
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
    
    return dataObj;
}

function writeData(data) { // used to write commands to serialport
    if(!port.isOpen) {
        return false;
    }
    port.write(data, function(err) {
        if (err) {
            return new Error('Error on write: ', err.message)
            // console.log('Error on write: ', err.message)
        }
        console.log('message written')
    });
    return true;
}

const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
});
const parser = port.pipe(new DelimiterParser({
    delimiter: 'sh'
}));

const connections = [];
// gpsd wrapper
const daemon = new Daemon({
    program: 'gpsd',
    device: '/dev/ttyACM0',
    port: 2947,
    pid: '/tmp/gpsd.pid',
    readOnly: false,
    logger: {
        info: function() {},
        warn: console.warn,
        error: console.error
    }
});

const listener = new Listener({
    port: 2947,
    hostname: 'localhost',
    logger:  {
        info: function() {},
        warn: console.warn,
        error: console.error
    },
    parse: true
});
const server = express(); // socketio server used as fallback in case of electron failure
//server.use(cors())
const httpServer = createServer(server);
const io = new Server(httpServer, {cors: {
    origin: '*',
  }});

port.open();

daemon.start(function() {
    console.log('Started');
});


parser.on('data', (stream) => { //reads data
    console.log("data recieved")
    let data = stream.toString().split('\n');

    try {
        let battery_data = BmsData(data);
        console.log(battery_data);
        io.emit('bms data', battery_data);
    } catch (e) {
        console.error(e);
        io.emit('error', e);
    }

});
port.on('error', (err) => {io.emit('error', err)});

io.on('connection', (socket) => {    
   socket.on('switch workspace', (workspace) => {
      console.log('Going to cameras');
      child_process.exec('hyprctl dispatch workspace '+workspace);
   });
	   console.log("device connected");
 socket.on('write to bms', () => {
      setInterval(() => {
        if(!writeData('sh\n')) {
            console.error('BMS is not responding')
            io.emit('error', 'BMS is not responding');
        }
    }, 500);

}) 
});



listener.connect(() => {
    console.log('Connected to gpsd');
    listener.watch();
    listener.on('TPV', (tpv) => {
console.log(tpv);
        io.emit('speed_data', tpv);
    });
});

httpServer.listen(3001, () => { //starts socketio server
    console.log('Site is running on port 3001')
});








