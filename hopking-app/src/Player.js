// Player.js
import * as PIXI from 'pixi.js';

export default class Player {
  constructor(app, controls, platforms = []) {
    this.app = app;
    this.controls = controls;
    this.platforms = platforms;
    this.originalHeight = 50;
    this.width = 50; // Assuming the player is a square
    this.isJumping = false;
    this.isSquishing = false;
    this.verticalSpeed = 0;
    this.horizontalSpeed = 0; // Added horizontal speed for jump direction
    this.gravity = 0.5;
    this.lastDirection = 0; // 0 for stationary, -1 for left, 1 for right
    //Jump Meter 
    this.jumpMeter = null;
    this.onPlatform = false;
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

  update(delta) {
    // Call updateJumpMeter in your update loop
    this.updateJumpMeter(delta);
    if (this.movingLeft && this.player.x > 0) {
      this.player.x -= 5 * delta;
    }
    if (this.movingRight && this.player.x < this.app.screen.width - this.width) {
      this.player.x += 5 * delta;
    }
    // Gravity and jumping
    if (this.isJumping || !this.onPlatform) {
      this.player.y += this.verticalSpeed * delta;
      this.verticalSpeed += this.gravity * delta;

      // Prevent jumping through the ceiling
      if (this.player.y < 0) {
        this.player.y = 0;
        this.verticalSpeed = 0;
      }
    } 

    // Prevent falling through the floor
    if (this.player.y > this.app.screen.height - this.originalHeight) {
      //console.log(this.player.y, this.app.screen.height, this.originalHeight);
      this.player.y = this.app.screen.height - this.originalHeight;
      this.isJumping = false;
      
      this.verticalSpeed = 0;
    }

    this.enforceAllCollisions();

  }
  enforceAllCollisions()
  {
    let onPlatform = false;
    const pB = {
      x: this.player.x,
      y: this.player.y,
      width: this.width,
      height: this.originalHeight
    };
    //console.log(pB.x, ' ', pB.y)
    this.platforms.forEach(platform => {
      // Use the explicitly stored properties for collision detection
      const plb = {
        x: platform.graphics.x,
        y: platform.graphics.y,
        width: platform.width,
        height: platform.height
      };
      this.rectCollision(pB, plb);
        
    });
    
    //console.log(onPlatform);
    return onPlatform;
  }
  rectCollision(a, b) {
    const collision = a.x + a.width > b.x &&
                      a.x < b.x + b.width &&
                      a.y + a.height > b.y &&
                      a.y < b.y + b.height;
    this.onPlatform = false;
    if (collision) {
        // Top of a is touching bottom of b
        if (a.y + a.height > b.y && a.y < b.y) {
            console.log("Top of platform is touching bottom of square");
            this.player.y = b.y - a.height;
            this.onPlatform = true;
            this.isJumping = false;
            this.verticalSpeed = 0;
        }

        // Bottom of a is touching top of b
        if (a.y < b.y + b.height && a.y + a.height > b.y + b.height) {
            console.log("Bottom of platform is touching top of square");
            this.player.y = b.y + b.height;
            this.verticalSpeed = 0;

        }
        // This seems to work fine without platform left/right boundaries
        // Left of a is touching right of b
        if (a.x + a.width > b.x && a.x < b.x) {
            console.log("Left of platform is touching right of square");
            // this.player.x = b.x - a.width; // Adjust player to the left side of the platform
            // this.horizontalSpeed = 0; // Stop horizontal movement
        }

        // Right of a is touching left of b
        if (a.x < b.x + b.width && a.x + a.width > b.x + b.width) {
            console.log("Right of platform is touching left of square");
            // this.player.x = b.x + b.width; // Adjust player to the right side of the platform
            // this.horizontalSpeed = 0; // Stop horizontal movement
        }
    }

    return collision;
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
