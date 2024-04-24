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
let countdownTimer;
const countdownDuration = 15;
let gameIsActive = false;

io.on('connection', (socket) => {
  //console.log('A user connected: ' + socket.id);

  socket.on('leaveGame', () => {
    waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
    io.emit('lobbyUpdate', {
      count: waitingPlayers.length,
      players: waitingPlayers.map(p => p.name)
    });
    socket.disconnect();  // Ensures that the socket disconnects from the server
  });

  socket.on('playerWin', (winnerData) => {

    if (!gameIsActive) return;  // Avoid multiple countdowns if game already ended
    clearInterval(countdownTimer);
    gameIsActive = false;
    console.log('emitting gameWon');
    io.emit('gameWon', winnerData);
    waitingPlayers = [];
    gameIsActive = false; 

  });

  socket.on('requestGameState', () => {

    io.emit('gameActive?', gameIsActive);
  });

  socket.on('joinLobby', (playerName) => {
    if (gameIsActive) {
      socket.emit('joinRejected', 'Game is currently active. Please wait.'); // Notify the client
      socket.disconnect(); // Optionally disconnect the socket
    } else {
      waitingPlayers.push({ socket, name: playerName });
      console.log(`Player ${playerName} (${socket.id}) joined the lobby.`);
      io.emit('joinAccepted', 'Game has not started yet! Welcome!');
      io.emit('lobbyUpdate', { count: waitingPlayers.length, players: waitingPlayers.map(p => p.name) });
    }
  });
  

  socket.on('startGameManually', () => {
    console.log('startGameManually is CALLED');
    if (!gameIsActive && waitingPlayers.length > 1) {
      //io.emit('startGame');
      waitingPlayers.forEach(p => p.socket.emit('startGame'));
      waitingPlayers = [];
      console.log('Game active is set to true');
      gameIsActive = true;
    }
  });

  socket.on('disconnect', () => {
    waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
    io.emit('lobbyUpdate', { count: waitingPlayers.length, players: waitingPlayers.map(p => p.name) });
    console.log('User disconnected: ' + socket.id);
    console.log('Updated Lobby: ' + waitingPlayers);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
