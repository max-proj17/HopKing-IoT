// PixiGame.jsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Player from './Player'; 
import Controls from './Controls'; 
import Platform from './Platform'; 

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
    

    // Generate platforms
    const platforms = generatePlatforms(app);
    const player = new Player(app, controls, platforms); // Pass controls to player
    //player.platforms = platforms; // Ensure the player has access to the platforms for collision detection

    app.ticker.add((delta) => {
      player.update(delta);
    });

    return () => {
      gameContainerRef.current.removeChild(app.view);
      app.destroy(true);
      controls.destroy(); // Ensure controls are also cleaned up
    };
  }, []);
  // Function to generate platforms
  // Function to generate platforms
  function generatePlatforms(app) {
    let platforms = [];
    const platformHeight = 20;
    const platformWidth = 100;
    const numPlatforms = 10; // Number of platforms
    const verticalSpacing = 50; // Minimum vertical space between platforms
    const topClearance = 100; // Space at the top before the first platform
    const bottomClearance = 50; // Space at the bottom to allow room for the player

    // Calculate the total usable height minus clearances and spacing for platforms
    const totalUsableHeight = app.screen.height - topClearance - bottomClearance - (verticalSpacing * (numPlatforms - 1));

    // Initialize y position for the first platform
    let y = topClearance;
    for (let i = 0; i < numPlatforms; i++) {
      let x;
      let overlap;
      do {
        overlap = false;
        x = Math.random() * (app.screen.width - platformWidth);
        // Check for horizontal overlap with other platforms
        for (let j = 0; j < platforms.length; j++) {
          if (Math.abs(platforms[j].graphics.x - x) < 50) {
            overlap = true;
            break;
          }
        }
      } while (overlap);

      platforms.push(new Platform(app, x, y, platformWidth, platformHeight));
      y += platformHeight + verticalSpacing; // Increase y position by platform height and minimum space
    }

    return platforms;
  }

  return <div ref={gameContainerRef} />;
};


export default PixiGame;
