// PixiGame.jsx
import React, { useEffect, useRef, memo } from 'react';
import * as PIXI from 'pixi.js';
import Player from './Player'; 
import Controls from './Controls'; 
import Platform from './Platform'; 

const PixiGame = memo(({ onPlayerWin, startGame, playerName, model, camera, videoRef }) => {
  const gameContainerRef = useRef(null);
  const appRef = useRef(null); // Ref to keep track of PIXI app
  const playerRef = useRef(null);

  useEffect(() => {
    if (!startGame) return;

    const app = new PIXI.Application({
      width: 800,
      height: 800,
      backgroundColor: 0x000000,
    });
    appRef.current = app;
    gameContainerRef.current.appendChild(app.view);
    // These are event listeners for the keyboard keys (not needed)
    const controls = new Controls();
    const platforms = generatePlatforms(app);
    //console.log(playerName);
    const player = new Player(app, controls, platforms, onPlayerWin, 
      playerName, camera, model, videoRef); // Pass controls to player
    playerRef.current = player;
    console.log('Starting game');

    // updates player movements, jump bar, etc (ADD playerMove here)
    app.ticker.add((delta) => {
      if(playerRef.current){
        playerRef.current.update(delta);
      }
    });

    return () => {
      if (gameContainerRef.current && app.view) {
        gameContainerRef.current.removeChild(app.view);
      }
      app.destroy(true);
      controls.destroy(); // Ensure controls are also cleaned up
    };

  }, [startGame, onPlayerWin, playerName]);

  // useEffect(() => {
  //   // This effect handles playerMove updates without reinitializing PIXI
  //   if (playerRef.current) {
  //     playerRef.current.listenControls(playerMove.current);
  //   }
  // }, [playerMove]); // Dependency on playerMove only

 
  // Function to generate platforms
  function generatePlatforms(app) {
    let platforms = [];
    const platformHeight = 20;
    const platformWidth = 150;
    const numPlatforms = 5;
    const verticalSpacing = 100;
    const topClearance = 100;
    const bottomClearance = 50;
  
    let y = topClearance;
    for (let i = 0; i < numPlatforms; i++) {
      let x, overlap, attempts = 0;
      do {
        if (attempts++ > 100) { // Break after 100 attempts to avoid infinite loop
          console.error('Failed to place platform without overlap after 100 attempts.');
          break;
        }
        overlap = false;
        x = Math.random() * (app.screen.width - platformWidth);
        for (let j = 0; j < platforms.length; j++) {
          if (Math.abs(platforms[j].graphics.x - x) < 90) { // Adjusted to 70
            overlap = true;
            break;
          }
        }
      } while (overlap);
  
      platforms.push(new Platform(app, x, y, platformWidth, platformHeight));
      y += platformHeight + verticalSpacing;
    }
    return platforms;
  }
  

  return <div ref={gameContainerRef} />;
});


export default PixiGame;
