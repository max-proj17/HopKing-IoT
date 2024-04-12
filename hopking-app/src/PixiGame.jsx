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
  function generatePlatforms(app) {
    let platforms = [];
    const platformHeight = 20;
    const platformWidth = 100;
    const numPlatforms = 1; // Number of platforms

    for (let i = 0; i < numPlatforms; i++) {
      const x = Math.random() * (app.screen.width - platformWidth);
      const y = (app.screen.height / numPlatforms) * i;
      //console.log('x,y in generatePlatforms: ', x, ':', y);
      platforms.push(new Platform(app, x, y, platformWidth, platformHeight));
    }

    // Ensure the last platform is near the top and the player can fit
    platforms.push(new Platform(app, Math.random() * (app.screen.width - platformWidth), app.screen.height - 150, platformWidth, platformHeight));

    return platforms;
  }
  return <div ref={gameContainerRef} />;
};


export default PixiGame;
