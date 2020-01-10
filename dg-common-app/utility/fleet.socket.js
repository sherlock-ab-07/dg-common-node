const express = require('express');
const http = require('http');
const io = require('socket.io');
const { initlog, device_data } = require('./color.log');

const _startServer = () => {
  const socketExpress = express();
  const server = http.createServer(socketExpress);
  const socketIO = io(server);
  server.listen(3150);
  return socketIO;
};
const socketIO = _startServer();
const init = () => {
  socketIO.on('connection', sock => {
    let response;
    initlog('connected to elock');
    sock.on('elock_data', async newSockData => {
      device_data(newSockData);
      //TODO : Add socekt response
      if (response !== null && response !== undefined && response !== '') {
        socketIO.emit('server_data', response);
      }
    });
  });
};

module.exports = { init, socketIO };
