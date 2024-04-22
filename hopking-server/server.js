// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Set this to the frontend's URL in production
    methods: ["GET", "POST"]
  }
});

let waitingPlayers = [];

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('joinLobby', () => {
    waitingPlayers.push(socket);
    console.log(`User ${socket.id} joined the lobby.`);

    // Emit to all sockets in the lobby that a new player has joined
    io.emit('lobbyUpdate', { count: waitingPlayers.length });

    // Debugging: start game immediately for testing
    if (waitingPlayers.length >= 1) {
      io.emit('startGame');
      waitingPlayers = [];
    }
  });

  socket.on('disconnect', () => {
    waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
    io.emit('lobbyUpdate', { count: waitingPlayers.length });
    console.log('User disconnected: ' + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
