import React, { useState, useEffect } from 'react';
import './App.css';
import PixiGame from './PixiGame';
import io from 'socket.io-client';
import * as tmPose from '@teachablemachine/pose'; // Import Teachable Machine modules


const App = () => {
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [winnerData, setWinnerData] = useState({});
  const [inLobby, setInLobby] = useState(false);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [playersInLobby, setPlayersInLobby] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false); // State to control the visibility of the leaderboard popup
  const [leaderboard, setLeaderBoard] = useState({});
  const [model, setModel] = useState(null); // State for the Teachable Machine model
  const [maxPredictions, setMaxPred] = useState(null);
  const [playerMove, setPlayerMove] = useState(null);

  const joinLobby = () => {

    if (!socket) {
      const playerName = prompt("Please enter your name.\nPlease no code injections such as \"\${name}\"");
      const newSocket = io('http://10.8.17.20:3000');  // Adjust this URL to your server's
      setSocket(newSocket);
      setPlayerData({ name: playerName });  // Store the player's name in state

      newSocket.on('connect', () => {
        newSocket.emit('joinLobby', playerName);

      }); 

      newSocket.on('joinRejected', (message) => {
        newSocket.disconnect();
        setSocket(null);
      });

      newSocket.on('joinAccepted', (message) =>{
        console.log('player ' + playerData + ' got refreshed');
        console.log(`Connected with ID: ${newSocket.id}` + ' name: ' + playerName);
        alert(message);
        setInLobby(true);
      })
      
    }
  };

  const toggleLeaderBoard = () => {

    console.log('in leaderboard');
    //make a socket connection to server
    const newSocket = io('http://10.8.17.20:3000');  // Adjust this URL to your server's
    setSocket(newSocket);
    //emit toggleLeaderBoard
    newSocket.on('connect', () => {
        newSocket.emit('toggleLeaderBoard');
        console.log('emitted toggleLeaderBoard');
    });
    // on.leaderboardUpdate - > change the html???
    newSocket.on('leaderBoardUpdate', (leaderboard) => {
      console.log('received leaderboard update');
      setLeaderBoard(leaderboard);
      console.log(leaderboard);
      setTimeout(() => {
        setShowLeaderboard(!showLeaderboard);
        newSocket.disconnect();
        setSocket(null);
        console.log(leaderboard);
      }, 0);
      
    });

  };

  

  const startGameManually = () => {
    if (socket && lobbyCount > 1 && !gameStarted) {  // Ensure there is at least 1 player
      console.log('CALLING SERVER TO START');
      socket.emit('startGameManually');  // Emit an event to the server to start the game manually
      setGameStarted(true);
      setInLobby(false);
      setGameWon(false);  // Ensure win state is reset when starting a new game
      setPlayerData({name: playerData.name});
    }
  };

  const handlePlayerWin = (name, timeTaken, jumpsTaken) => {
    console.log('Player ' + name + ' won.');
    const winnerData = { name, timeTaken, jumpsTaken };
    console.log('emitting playerWin');
    socket.emit('playerWin', winnerData);
    
  };

  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setInLobby(false);
    setPlayerData({});
    socket.emit('leaveGame');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
  };

  useEffect(() => {

    // Loading model hypotetically
    async function loadTMModel() {
      const URL = 'game_model/model.json'; // Replace 'your_model_url' with your actual model URL
      const metadataURL = 'game_model/metadata.json';
      const model = await tmPose.load(URL, metadataURL);
      setMaxPred(model.getTotalClasses());
      setModel(model);

      //camera list setup function here
    }

    loadTMModel();

    return () => {
      // Cleanup code
    };
  }, []);

  // Function to predict poses using the loaded model
  const predictPoses = async () => {
    if (model) {
      // NO CAMERA SETUP YET 
      // Get a prediction from the model (videoElement (camera) should be used in place of someImageData)
      const { pose, posenetOutput } = await model.estimatePose(someImageData); // Pass your image data here
      let prediction = await model.predict(posenetOutput); //a dictionary/OBJECT

      // Swapping probability because of camera flip
      let tmp = prediction[3].probability;
      prediction[3].probability = prediction[4].probability;
      prediction[4].probability = tmp;

      // Sort predictions by probability in descending order
      prediction.sort((a, b) => b.probability - a.probability); 

      // send prediction[0].className to PixiGame ---> Player
      setPlayerMove(prediction[0].className);

    }
  };



  useEffect(() => {
    if (socket) {



      socket.on('gameWon', (winnerData) => {
     
        console.log('received gameWon from ' + winnerData.name);
        setWinnerData(winnerData);
        setGameWon(true);       // Show win screen
        setGameStarted(false); // Or manage another state to show the win screen
        console.log('gameWon ' + gameWon);
        console.log('gameStarted ' + gameStarted);
      });

      socket.on('lobbyUpdate', data => {
        setLobbyCount(data.count);
        setPlayersInLobby(data.players);

      });

      socket.on('startGame', () => {
        console.log('Game is starting!');
        setGameStarted(true);
        setInLobby(false);
        setGameWon(false);  // Ensure win state is reset when starting a new game
        setPlayerData({name: playerData.name});
      });
      socket.on('mainMenu', () => {
        console.log('Going back to main menu');
        setWinnerData(null);
        backToStart();
      });

      socket.on('leaderBoardUpdate', (leaderboard) =>
      {
        setLeaderBoard(leaderboard);
      });
     
      return () => {
        socket.off('lobbyUpdate');
        socket.off('startGame');
        socket.off('gameWon');
        socket.off('updateCountdown');
        socket.off('mainMenu');
        socket.off('leaderBoardUpdate');
      };
    }
  }, [socket]);

  return (
    <div className="app-container">
      {!gameStarted && !gameWon && !inLobby ? (
        <div>
          <h1>Welcome to HopKing</h1>
          <button className="start-button" onClick={joinLobby}>Join Lobby</button>
          <button className="start-button" onClick={toggleLeaderBoard}>View Leaderboard</button>
          {showLeaderboard && (
            <div className="leaderboard-popup">
              <h2>Leaderboard</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Score</th>
                      <th>Wins</th>
                      <th>Jumps</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(leaderboard).map(([key, value]) => (
                      <tr key={key}>
                        <td>{value[0]}</td>
                        <td>{value[1]}</td>
                        <td>{value[4]}</td>
                        <td>{value[3]}</td>
                        <td>{value[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={toggleLeaderBoard}>Close</button>
            </div>
          )}
        </div>
        
      ) : inLobby ? (
        <div>
          <h2>Waiting Room</h2>
          <p>Players in lobby: {lobbyCount}</p>
          {playersInLobby.map(player => <p key={player}>{player}</p>)}
          {lobbyCount > 1 && <button className="start-button" onClick={startGameManually}>Start Game</button>}         
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : gameWon ? (
        <div className="win-screen">
          <p>Player {winnerData.name} won! Time Taken: {winnerData.timeTaken} seconds with {winnerData.jumpsTaken} jumps.</p>
      
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : (
        <PixiGame onPlayerWin={handlePlayerWin} startGame={gameStarted} playerName={playerData.name} playerMove={playerMove}/>
      )}
    </div>
  );
};

export default App;
