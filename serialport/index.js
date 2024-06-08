import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { Server } from 'socket.io';
import {createServer} from 'http';
import express from 'express';
import cors from 'cors';
import {Daemon, Listener} from 'node-gpsd';

function BmsData(data) {
    // Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "mcu> ")
    data.shift();
    data.shift();
    data.pop();

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

    const dataObj = {};
    for (let item of data) {
        dataObj[item[0]] = item[1];
    }

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

    return dataObj;
}

function writeData(data) { // used to write commands to serialport
    if(!port.isOpen) {
        return false;
    }
    port.write(data, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message)
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
    let data = stream.toString().split('\n');
    let battery_data = BmsData(data);
    console.log(battery_data);
    io.emit('bms data', battery_data);
});
port.on('error', (err) => {io.emit('error', err)});

io.on('connection', (socket) => {
    console.log('New connection!');
    connections.push(socket);
    if(!writeData('sh\n')) {
        console.error('BMS is not connected')
        io.emit('error', 'BMS is not connected');
    }
    if(!listener.isConnected()) {
        io.emit('error', 'GPSD is not connected');
    }
    socket.on('disconnect', () => {
        console.log('User disconnected');
        const index = connections.indexOf(socket);
        connections.splice(index, 1);
    
    });
});

listener.connect(() => {
    console.log('Connected to gpsd');
    listener.watch();
    listener.on('TPV', (tpv) => {
        console.log(tpv);
        io.emit('speed_data', tpv);
    });
});

httpServer.listen(3000, () => { //starts socketio server
    console.log('Site is running on port 3000')
});








