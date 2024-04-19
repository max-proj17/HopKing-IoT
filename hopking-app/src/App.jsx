import React, { useState } from 'react';
import './App.css';
import PixiGame from './PixiGame';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };
  
  const handlePlayerWin = () => {
    setPlayerWon(true);
  };

  return (
    <div>
      <h1>Welcome to HopKing</h1>
      {!gameStarted ? (
        <button className="start-button" onClick={startGame}>Play</button>
      ) : playerWon ? (
        <div>Player won! Time Taken: {/* time logic here */}</div>
      ) : (
        <PixiGame onPlayerWin={handlePlayerWin} />
      )}
    </div>
  );
};

export default App;
