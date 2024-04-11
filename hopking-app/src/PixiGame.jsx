// PixiGame.jsx or PixiGame.js
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Player from './Player'; // Adjust the path as necessary

const PixiGame = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
    });

    gameContainerRef.current.appendChild(app.view);
    const player = new Player(app);

    const keysPressed = {};

    const onKeyDown = (e) => {
      keysPressed[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        player.squish();
      }
    };

    const onKeyUp = (e) => {
      if (e.key === ' ') {
        player.jump();
      }
      delete keysPressed[e.key.toLowerCase()];
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    app.ticker.add((delta) => {
      if (keysPressed['a']) {
        player.moveLeft(delta);
      }
      if (keysPressed['d']) {
        player.moveRight(delta);
      }
      
      player.update(delta);
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      gameContainerRef.current.removeChild(app.view);
      app.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};

export default PixiGame;


