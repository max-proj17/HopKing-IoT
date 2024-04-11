// PixiGame.jsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Player from './Player'; // Adjust the path as necessary
import Controls from './Controls'; // Adjust the path as necessary

const PixiGame = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 800,
      height: 800,
      backgroundColor: 0x000000,
    });

    gameContainerRef.current.appendChild(app.view);
    const controls = new Controls();
    const player = new Player(app, controls); // Pass controls to player

    app.ticker.add((delta) => {
      player.update(delta);
    });

    return () => {
      gameContainerRef.current.removeChild(app.view);
      app.destroy(true);
      controls.destroy(); // Ensure controls are also cleaned up
    };
  }, []);

  return <div ref={gameContainerRef} />;
};

export default PixiGame;
