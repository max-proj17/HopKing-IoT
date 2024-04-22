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

  socket.on('joinLobby', (playerName) => {
    waitingPlayers.push({ socket, name: playerName });
    console.log(`Player ${playerName} (${socket.id}) joined the lobby.`);

    // Emit to all sockets in the lobby the current player list
    io.emit('lobbyUpdate', { 
        count: waitingPlayers.length, 
        players: waitingPlayers.map(p => p.name) });

    // // Debugging: start game immediately for testing, remove this in production or adjust as needed
    // if (waitingPlayers.length >= 1) { // Change to the desired number of minimum players
    //   io.emit('startGame');
    //   waitingPlayers = []; // Clear the lobby after starting the game
    // }
  });
  socket.on('startGameManually', () => {
    if (waitingPlayers.length >= 1) {  // This checks if there are enough players to start the game
      io.emit('startGame');
      waitingPlayers = []; // Optionally clear the lobby after starting the game
    }
  });

  socket.on('disconnect', () => {
    waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
    io.emit('lobbyUpdate', { count: waitingPlayers.length, players: waitingPlayers.map(p => p.name) });
    console.log('User disconnected: ' + socket.id);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
