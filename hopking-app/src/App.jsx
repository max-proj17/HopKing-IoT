import React, { useState } from 'react';
import './App.css';
import PixiGame from './PixiGame';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerData, setPlayerData] = useState({});

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);  // Ensure win state is reset when starting a new game
    setPlayerData({});
  };
  
  const handlePlayerWin = (name, timeTaken, jumpsTaken) => {
    setPlayerData({ name, timeTaken, jumpsTaken });
    setGameWon(true);       // Show win screen
    setGameStarted(false); // Or manage another state to show the win screen
  };
  const backToStart = () => {
    setGameStarted(false);
    setGameWon(false);
    setPlayerData({});
  };

  return (
    <div className="app-container">
      {!gameStarted && !gameWon ? (
        <div>
          <h1>Welcome to HopKing</h1>
          <button className="start-button" onClick={startGame}>Play</button>
        </div>
      ) : gameWon ? (
        <div className="win-screen">
          <p>Player <span>{playerData.name}</span> won! Time Taken: <span>{playerData.timeTaken}</span> seconds with <span>{playerData.jumpsTaken}</span> jumps.</p>
          <button className="start-button" onClick={startGame}>Play Again</button>
          <button className="start-button" onClick={backToStart}>Back to Start</button>
        </div>
      ) : (
        <PixiGame onPlayerWin={handlePlayerWin} startGame={gameStarted} />
      )}
    </div>
  );
};

export default App;
