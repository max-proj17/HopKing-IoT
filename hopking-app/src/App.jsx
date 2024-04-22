import React, { useState, useEffect } from 'react';
import './App.css';
import PixiGame from './PixiGame';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [countdown, setCountdown] = useState(15);

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);  // Ensure win state is reset when starting a new game
    setPlayerData({});
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
    setPlayerData({});
    setCountdown(15);
  };

  // Countdown effect
  useEffect(() => {
    if (gameWon && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (countdown === 0) {
      backToStart(); // Automatically navigate back if no interaction
    }
  }, [gameWon, countdown]);

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
          <p>Returning to start in {countdown} seconds...</p>
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
