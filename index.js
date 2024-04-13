import { SerialPort, ReadlineParser } from 'serialport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import {dirname, join} from 'node:path';
import express from "express";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

function writeData(data,port) {
  
}
async function readData(port,socket) {
  const parser = port.pipe(new ReadlineParser());
  parser.on('data', (data) => {
    socket.emit('data', data);
    console.log("Data: ", data)
  });
  

}


io.on("connection", (socket) => {
  console.log(socket);

  const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200,
  });

  readData(port,socket);
  const myTimeout = setInterval(() => {
    port.write('sh\n', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      console.log('message written')
    });
  },5000)
  


// 
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });  
})



readData
const _dirname = dirname(fileURLToPath(import.meta.url));
app.use('/',express.static(join(_dirname,"static")));

app.get('/', (req, res) => {
  res.sendFile(join(_dirname,'/static/index.html'));
});
httpServer.listen(3000);


/*
// Create a port

  */