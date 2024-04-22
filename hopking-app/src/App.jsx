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
    <div>
      <h1>Welcome to HopKing</h1>
      {!gameStarted && !gameWon ? (
        <button className="start-button" onClick={startGame}>Play</button>
      ) : gameWon ? (
        <div>
          Player {playerData.name} won! Time Taken: {playerData.timeTaken} seconds with {playerData.jumpsTaken} jumps.
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
