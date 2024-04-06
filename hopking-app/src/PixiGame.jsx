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
    const originalHeight = 50; // Original height of the player
    player.beginFill(0xFFFFFF); // White square
    player.drawRect(0, 0, 50, originalHeight); // x, y, width, height
    player.endFill();
    player.x = app.screen.width / 2 - 25; // Centering the square
    player.y = app.screen.height - 100; // Position player above the bottom
    app.stage.addChild(player);

    // Physics properties
    let speed = 0;
    let verticalSpeed = 0;
    const gravity = 0.5;
    let isJumping = false;
    let isSquishing = false; // State for squishing

    const onKeyDown = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        speed = -5;
      } else if (e.key === 'd' || e.key === 'D') {
        speed = 5;
      } else if (e.key === ' ' && !isJumping && !isSquishing) {
        isSquishing = true; // Start squishing
        player.clear();
        player.beginFill(0xFFFFFF);
        // Squish effect: adjust starting Y position and reduce height
        player.drawRect(0, originalHeight / 2, 50, originalHeight / 2);
        player.endFill();
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        speed = 0;
      } else if (e.key === ' ' && isSquishing) {
        isSquishing = false;
        isJumping = true;
        verticalSpeed = -10; // Jump strength

        // Reset the squish effect
        player.clear();
        player.beginFill(0xFFFFFF);
        player.drawRect(0, 0, 50, originalHeight);
        player.endFill();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    app.ticker.add((delta) => {
      // Horizontal movement
      player.x += speed * delta;

      // Vertical movement (jumping and gravity)
      if (isJumping) {
        player.y += verticalSpeed;
        verticalSpeed += gravity;
      }

      // Collision detection with the ground
      if (player.y >= app.screen.height - 100) {
        player.y = app.screen.height - 100;
        isJumping = false;
        verticalSpeed = 0;
      }
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
