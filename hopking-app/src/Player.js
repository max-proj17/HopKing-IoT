// Player.js
import * as PIXI from 'pixi.js';

export default class Player {
  constructor(app) {
    this.app = app;
    this.originalHeight = 50;
    this.isJumping = false;
    this.isSquishing = false;
    this.verticalSpeed = 0;
    this.gravity = 0.5;
    this.createPlayer();
  }

  createPlayer() {
    this.player = new PIXI.Graphics();
    this.player.beginFill(0xFFFFFF); // White square
    this.player.drawRect(0, 0, 50, this.originalHeight); // Draw the player
    this.player.endFill();
    this.player.x = this.app.screen.width / 2 - 25; // Center the player
    this.player.y = this.app.screen.height - 100; // Position above the bottom
    this.app.stage.addChild(this.player);
  }

  squish() {
    if (!this.isJumping) {
      this.isSquishing = true;
      this.player.clear();
      this.player.beginFill(0xFFFFFF);
      this.player.drawRect(0, this.originalHeight / 2, 50, this.originalHeight / 2);
      this.player.endFill();
    }
  }

  jump() {
    if (this.isSquishing) {
      this.isSquishing = false;
      this.isJumping = true;
      this.verticalSpeed = -10;

      this.player.clear();
      this.player.beginFill(0xFFFFFF);
      this.player.drawRect(0, 0, 50, this.originalHeight);
      this.player.endFill();
    }
  }

  update(delta) {
    // Handle jumping
    if (this.isJumping) {
      this.player.y += this.verticalSpeed;
      this.verticalSpeed += this.gravity;

      // Collision detection with the ground
      if (this.player.y >= this.app.screen.height - 100) {
        this.player.y = this.app.screen.height - 100;
        this.isJumping = false;
        this.verticalSpeed = 0;
      }
    }
  }

  moveLeft(delta) {
    this.player.x -= 5 * delta;
  }

  moveRight(delta) {
    this.player.x += 5 * delta;
  }
}
