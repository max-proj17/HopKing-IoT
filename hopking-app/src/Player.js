// Player.js
import * as PIXI from 'pixi.js';

export default class Player {
  constructor(app, controls) {
    this.app = app;
    this.controls = controls;
    this.originalHeight = 50;
    this.isJumping = false;
    this.isSquishing = false;
    this.verticalSpeed = 0;
    this.horizontalSpeed = 0; // Added horizontal speed for jump direction
    this.gravity = 0.5;
    this.lastDirection = 0; // 0 for stationary, -1 for left, 1 for right
    //Jump Meter 
    this.jumpMeter = null;
    this.jumpMeterValue = 0; // Range from 0 to 1
    this.jumpMeterIncreasing = true;
    this.createPlayer();
    this.setupControls();
    this.createJumpMeter();
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

  setupControls() {
    this.controls.registerKey('a', (isDown) => {
      this.movingLeft = isDown;
      if (isDown) this.lastDirection = -1;
    });

    this.controls.registerKey('d', (isDown) => {
      this.movingRight = isDown;
      if (isDown) this.lastDirection = 1;
    });

    this.controls.registerKey(' ', (isDown) => {
        if (isDown && !this.isJumping) {
          if (!this.isSquishing) {
            this.squish();
            this.showJumpMeter();
          } else {
            this.jump();
            this.hideJumpMeter();
          }
        }
      });
  }
  createJumpMeter() {
    this.jumpMeter = new PIXI.Graphics();
    this.jumpMeter.beginFill(0xFF0000); // Red for visibility
    // Initial drawing of the meter, invisible until squishing starts
    this.jumpMeter.drawRect(this.player.x - 50, this.player.y - 20, 100, 5);
    this.jumpMeter.endFill();
    this.jumpMeter.visible = false;
    this.app.stage.addChild(this.jumpMeter);
  }

  showJumpMeter() {
    this.jumpMeter.visible = true;
    this.jumpMeterValue = 0;
    this.jumpMeterIncreasing = true;
  }

  hideJumpMeter() {
    this.jumpMeter.visible = false;
  }

  updateJumpMeter(delta) {
    if (!this.jumpMeter.visible) return;

    const speed = 0.05; // Adjust for faster/slower meter movement
    this.jumpMeterValue += this.jumpMeterIncreasing ? speed * delta : -speed * delta;
    // Reverse direction at limits
    if (this.jumpMeterValue > 1 || this.jumpMeterValue < 0) {
      this.jumpMeterIncreasing = !this.jumpMeterIncreasing;
      this.jumpMeterValue = Math.max(0, Math.min(this.jumpMeterValue, 1)); // Clamp between 0 and 1
    }

    // Update the graphical representation of the meter based on jumpMeterValue
    this.jumpMeter.clear();
    this.jumpMeter.beginFill(0xFF0000);
    this.jumpMeter.drawRect(this.player.x - 50, this.player.y - 20, 100 * this.jumpMeterValue, 5);
    this.jumpMeter.endFill();
  }

  squish() {
    if (!this.isJumping && !this.isSquishing) {
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
      // Use jumpMeterValue to determine vertical and horizontal jump strength
      this.verticalSpeed = -17 * this.jumpMeterValue; // Example: scale the jump strength
      this.horizontalSpeed = this.lastDirection * 7 * this.jumpMeterValue;
      this.player.clear();
      this.player.beginFill(0xFFFFFF);
      this.player.drawRect(0, 0, 50, this.originalHeight);
      this.player.endFill();
    }
  }

  attemptJump() {
    if (!this.isJumping && !this.isSquishing) {
      this.squish();
    } else if (this.isSquishing) {
      this.jump();
    }
  }

  update(delta) {
    // Call updateJumpMeter in your update loop
    this.updateJumpMeter(delta);
    if (this.movingLeft) {
      this.moveLeft(delta);
    }
    if (this.movingRight) {
      this.moveRight(delta);
    }
    if (this.isJumping) {
      this.player.x += this.horizontalSpeed * delta;
      this.player.y += this.verticalSpeed * delta;
      this.verticalSpeed += this.gravity * delta; // Apply gravity to vertical speed

      // Reset jump if player reaches the ground
      if (this.player.y >= this.app.screen.height - 100) {
        this.player.y = this.app.screen.height - 100;
        this.isJumping = false;
        this.verticalSpeed = 0;
        this.horizontalSpeed = 0; // Reset horizontal speed after landing
      }
    }
  }

  moveLeft(delta) {
    if (!this.isJumping) { // Prevent adjusting horizontal speed mid-jump
      this.player.x -= 5 * delta;
    }
  }

  moveRight(delta) {
    if (!this.isJumping) { // Prevent adjusting horizontal speed mid-jump
      this.player.x += 5 * delta;
    }
  }
}
