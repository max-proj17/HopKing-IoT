import './App.css';
import { useMemo } from 'react';
import { BlurFilter, TextStyle } from 'pixi.js';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import React from 'react';
import PixiGame from './PixiGame'; // Make sure the path matches where you saved PixiGame.jsx

const App = () => {
  return (
    <div>
      <h1>Welcome to HopKing</h1>
      <PixiGame />
    </div>
  );
};

export default App;
