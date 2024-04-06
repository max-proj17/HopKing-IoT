// PixiGame.jsx
// PixiGame.jsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const PixiGame = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000, // Black background
    });

    gameContainerRef.current.appendChild(app.view);

    const player = new PIXI.Graphics();
    player.beginFill(0xFFFFFF); // White square
    player.drawRect(0, 0, 50, 50); // x, y, width, height
    player.endFill();
    player.x = app.screen.width / 2 - 25; // Centering the square
    player.y = app.screen.height / 2 - 25;
    app.stage.addChild(player);

    // Handling keyboard events
    let speed = 0;
    const onKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        speed = -5;
      } else if (e.key === 'd' || e.key === 'D') {
        speed = 5;
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        speed = 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    app.ticker.add((delta) => {
      player.x += speed * delta;
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
