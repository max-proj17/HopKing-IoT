import React, { useState } from 'react';
import './App.css';
import PixiGame from './PixiGame';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div>
      <h1>Welcome to HopKing</h1>
      {!gameStarted ? (
        <button className="start-button" onClick={startGame}>Play</button>
      ) : (
        <PixiGame />
      )}
    </div>
  );
};

export default App;
