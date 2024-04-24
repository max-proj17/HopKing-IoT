import React, { useState, useEffect } from 'react';
import './App.css';
import PixiGame from './PixiGame';
import io from 'socket.io-client';

//const socket = io('http://localhost:3000'); // Adjust this URL to your server's

const App = () => {
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [winnerData, setWinnerData] = useState({});
  const [countdown, setCountdown] = useState(15);
  const [inLobby, setInLobby] = useState(false);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [playersInLobby, setPlayersInLobby] = useState([]);
  const [onWinScreen, setOnWinScreen] = useState(false);


  const joinLobby = () => {

    if (!socket) {
      const playerName = prompt("Please enter your name:");
      const newSocket = io('http://localhost:3000');  // Adjust this URL to your server's
      setSocket(newSocket);
      setPlayerData({ name: playerName });  // Store the player's name in state

      newSocket.on('connect', () => {
        newSocket.emit('joinLobby', playerName);

      }); 

      newSocket.on('joinRejected', (message) => {
        //alert(message); // Show the user why they can't join
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

  const startGameManually = () => {
    if (socket && lobbyCount > 1 && !gameStarted) {  // Ensure there is at least 1 player
      console.log('CALLING SERVER TO START');
      socket.emit('startGameManually');  // Emit an event to the server to start the game manually
      //console.log('playerData.name is: ' + playerData.name);
      setGameStarted(true);
      setInLobby(false);
      setGameWon(false);  // Ensure win state is reset when starting a new game
      setPlayerData({name: playerData.name});
    }
  };

 
  //   setGameStarted(true);
  //   setGameWon(false);  // Ensure win state is reset when starting a new game
  //   setPlayerData({name: playerData.name});
  // };
  
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
    if (socket) {

      socket.on('gameWon', (winnerData) => {
     
        console.log('received gameWon from ' + winnerData.name);
        setWinnerData(winnerData);
        setGameWon(true);       // Show win screen
        setGameStarted(false); // Or manage another state to show the win screen
        console.log('gameWon ' + gameWon);
        console.log('gameStarted ' + gameStarted);
      });

      //   setGameWon(false);
      //   setInLobby(true);
      //   setWinnerData(null);
      //   setPlayerData({});
      //   //setCountdown(15);  // Reset for next game
      // });
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
     
      return () => {
        socket.off('lobbyUpdate');
        socket.off('startGame');
        socket.off('gameWon');
        socket.off('updateCountdown');
        socket.off('mainMenu');
      };
    }
  }, [socket]);

  return (
    <div className="app-container">
      {!gameStarted && !gameWon && !inLobby ? (
        <div>
          <h1>Welcome to HopKing</h1>
          <button className="start-button" onClick={joinLobby}>Join Lobby</button>
        </div>
      ) : inLobby ? (
        <div>
          <h2>Waiting Room</h2>
          <p>Players in lobby: {lobbyCount}</p>
          {playersInLobby.map(player => <p key={player}>{player}</p>)}
          {lobbyCount > 1 && <button className="start-button" onClick={startGameManually}>Start Game</button>}
          {/* <button className="start-button" onClick={startGameManually} disabled={lobbyCount < 1}>Start Game</button> */}
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : gameWon ? (
        <div className="win-screen">
          <p>Player {winnerData.name} won! Time Taken: {winnerData.timeTaken} seconds with {winnerData.jumpsTaken} jumps.</p>
          {/* <button className="start-button" onClick={joinLobby}>Play Again</button> */}
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : (
        <PixiGame onPlayerWin={handlePlayerWin} startGame={gameStarted} playerName={playerData.name} />
      )}
    </div>
  );
};

export default App;
