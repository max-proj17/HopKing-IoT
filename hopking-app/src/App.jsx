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
  const [countdown, setCountdown] = useState(15);
  const [inLobby, setInLobby] = useState(false);
  const [lobbyCount, setLobbyCount] = useState(0);
  const [playersInLobby, setPlayersInLobby] = useState([]);


  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);  // Ensure win state is reset when starting a new game
    setPlayerData({name: playerData.name});
    setCountdown(15); // Reset countdown when game starts
  };
  
  const handlePlayerWin = (name, timeTaken, jumpsTaken) => {
    setPlayerData({ name, timeTaken, jumpsTaken });
    setGameWon(true);       // Show win screen
    setGameStarted(false); // Or manage another state to show the win screen
  };
  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setInLobby(false);
    setPlayerData({});
    setCountdown(15);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
  };

  const joinLobby = () => {
    const playerName = prompt("Please enter your name:");
    if (playerName && !socket) {
      const newSocket = io('http://localhost:3000');  // Adjust this URL to your server's
      setSocket(newSocket);
      newSocket.on('connect', () => {
        console.log(`Connected with ID: ${newSocket.id}`);
        newSocket.emit('joinLobby', playerName);
        setPlayerData({ name: playerName });  // Store the player's name in state
      });
    }
  };

  // Countdown effect
  useEffect(() => {
    if (gameWon) {
      const timerId = setTimeout(() => {
        if (countdown > 0) {
          setCountdown(countdown - 1);
        } else {
          backToStart(); // Automatically navigate back if no interaction
        }
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCountdown(15); // Reset countdown when game is not won
    }
  }, [gameWon, countdown]);


  useEffect(() => {
    if (socket) {
      socket.on('lobbyUpdate', data => {
        setLobbyCount(data.count);
        setPlayersInLobby(data.players);
        setInLobby(true);
      });

      socket.on('startGame', () => {
        console.log('Game is starting!');
        setGameStarted(true);
        setInLobby(false);
      });

      return () => {
        socket.off('lobbyUpdate');
        socket.off('startGame');
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
          {lobbyCount > 1 && <button className="start-button" onClick={startGame}>Start Game</button>}
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : gameWon ? (
        <div className="win-screen">
          <p>Player {playerData.name} won! Time Taken: {playerData.timeTaken} seconds with {playerData.jumpsTaken} jumps.</p>
          <button className="start-button" onClick={startGame}>Play Again</button>
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : (
        <PixiGame onPlayerWin={handlePlayerWin} startGame={gameStarted} playerName={playerData.name} />
      )}
    </div>
  );
};

export default App;
