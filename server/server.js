// server.js
const express = require('express');
const http = require('http');
const admin = require('firebase-admin');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Set this to the frontend's URL in production
    methods: ["GET", "POST"]
  }
});

const cors = require('cors');
app.use(cors());

// Initialize Firebase Admin
var serviceAccount = require('./iot-game-4d3b5-firebase-adminsdk-qfepa-f088df8ef5.json');
const { threadId } = require('worker_threads');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-game-4d3b5-default-rtdb.firebaseio.com/"
});

const db = admin.database();


// Server will:
// - Fetch top 10 playerData from Firebase and put into
//   a dictionary (Or some similar structure)
// - Send the dictionary to the Client to display
//
// On playerWin -  use winnerData.name to fetch from database. Compare and log perfMetric (), jumps, time to firebase
// ONLY IF it is greater than their previous HS.
//


let waitingPlayers = [];
let countdownTimer;
const countdownDuration = 15;
let gameIsActive = false;
let leaderboard = {};


// On startup of server, fetch leaderboard
// Query to get scores sorted by the 'score' child
async function updateLeaderboard(){
    const scoresRef = db.ref('scores');

    const snapshot = await scoresRef.orderByChild('score').once('value');

    const scores = [];
    // Firebase returns the data in ascending order by default
    snapshot.forEach(childSnapshot => {
      // Push the whole data object including userId as key
      scores.push({
        userId: childSnapshot.key,
        ...childSnapshot.val() // Spread the values to include all child data
      });
    });


    // Reverse to make it descending order for scores
    //scores.reverse();

    const rankingNames = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];

    // Sort the scores in descending order
    scores.sort((a, b) => b.score - a.score);

    //console.log('Sorted scores is: ' + scores[0]['userId'] + ' ' + scores[0]['score']);

    // Populate the leaderboard object
    scores.forEach((score, index) => {
      if (index < 10) { // Limit to top 10
        leaderboard[rankingNames[index]] = [
          score['userId'],
          score['score'].toFixed(2), // Formatting the score to two decimal places
          score['timeTaken'].toFixed(3), // Formatting the time to three decimal places
          score['jumpsTaken'],
          score['wins']
        ];
      }
    });

  // console.log(JSON.stringify(leaderboard));
  // console.log('Sorted Leaderboard: ' + leaderboard['first'][0] + ' ' + leaderboard['first'][1]);
}


function updateScore(userId, time, jumps)
{

  const score = 4000 * (2.71828 **( -0.03 * time )) / (0.22 * jumps + 1);

  // Reference to the user's score
  const userScoreRef = db.ref('scores/' + userId);

  // Transaction to update the score only if the new score is higher
  userScoreRef.transaction((currentData) => {
    const wins = currentData && currentData.wins ? currentData.wins + 1 : 1;
    if (currentData === null || score > currentData.score) {
      // const wins = currentData && currentData.wins ? currentData.wins + 1 : 1;
      return { score: score, timeTaken: time, jumpsTaken: jumps, timestamp: Date.now(), wins: wins };
    } else {
      return { score: currentData.score, timeTaken: currentData.timeTaken,
        jumpsTaken: currentData.jumpsTaken, timestamp: currentData.timestamp, wins: wins }; // Abort the transaction if the new score isn't higher
    }
  }, (error, committed, snapshot) => {
    if (error) {
      console.log(`Transaction failed abnormally!`, error);
    } else if (!committed) {
      console.log(`Score for user ${userId} not updated as the new score was lower.`);
    } else {
      const newScore = snapshot.val().score;
      console.log(`New high score for user ${userId}: ${newScore}`);
    }
  });

}

updateLeaderboard();



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
    console.log('Winner: ' + winnerData.name + ' Time Taken: ' + winnerData.timeTaken + ' Jumps Taken: ' + winnerData.jumpsTaken);

    updateScore(winnerData.name, winnerData.timeTaken, winnerData.jumpsTaken);

    //update leaderboard dictionary
    updateLeaderboard();
    io.emit('leaderBoardUpdate', leaderboard);

  });


  socket.on('joinLobby', (playerName) => {
    if (gameIsActive) {
      socket.emit('joinRejected', 'Game is currently active. Please wait.'); // Notify the client
      //socket.disconnect(); // Optionally disconnect the socket
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
      waitingPlayers.forEach(p => p.socket.emit('startGame'));
      waitingPlayers = [];
      console.log('Game active is set to true');
      gameIsActive = true;
    }
  });

  socket.on('disconnect', () => {
    if(!gameIsActive){
      waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
      io.emit('lobbyUpdate', { count: waitingPlayers.length, players: waitingPlayers.map(p => p.name) });
      console.log('User disconnected: ' + socket.id);
      console.log('Updated Lobby: ' + waitingPlayers);
    }
  });

  socket.on('toggleLeaderBoard', () => {

    // send leaderboard object
    socket.emit('leaderBoardUpdate', leaderboard);

  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
