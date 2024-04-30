// Player.js
//import { Webcam } from '@teachablemachine/pose';
import * as PIXI from 'pixi.js';

export default class Player {
  constructor(app, controls, platforms = [], onPlayerWin, name = "Player", camera, model, videoRef) {
    this.app = app;
    this.controls = controls;
    this.platforms = platforms;
    this.app = app;
    this.controls = controls;
    this.platforms = platforms;
    this.name = name;  // Default name, can be modified to take this as parameter
    this.timeStarted = Date.now();
    this.timeTaken = 0;
    this.jumpsTaken = 0;


    this.originalHeight = 50;
    this.width = 50; // Assuming the player is a square
    this.isJumping = false;
    this.isSquishing = false;
    this.verticalSpeed = 0;
    this.horizontalSpeed = 0; // Added horizontal speed for jump direction
    this.gravity = 0.5;
    this.lastDirection = 0; // 0 for stationary, -1 for left, 1 for right
    this.onPlayerWin = onPlayerWin; // Callback when the player wins

    //Jump Meter
    this.jumpMeter = null;
    this.onPlatform = false;
    this.jumpMeterValue = 0; // Range from 0 to 1
    this.jumpMeterIncreasing = true;

    this.camera = camera;
    this.model = model;
    this.videoRef = videoRef;

    this.movingRight = false;
    this.movingLeft = false;

    this.createPlayer();
    //this.setupControls(); // replaced with listenControls()
    //this.listenControls();
    this.initPosePrediction();
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

  // Make this 'listenControls' with if statements being the class names and run this in update(delta, playerMove)
  // And run 'listenControls' before everything else happens

  // Controls.js probably wont be needed as it just sets up the event listeners for the WASD keys
  // this.controls is just an instance of the Controls object (see PixiGame.js)

//  setupControls() {
  // listenControls(playerMove) {
  //   //replace key listeners with camera-feed/model-output listener?
  //   console.log(playerMove);
  //   /*
  //   this.controls.registerKey('a', (isDown) => {
  //     this.movingLeft = isDown;
  //     if (isDown) this.lastDirection = -1;
  //   });

  //   this.controls.registerKey('d', (isDown) => {
  //     this.movingRight = isDown;
  //     if (isDown) this.lastDirection = 1;
  //   });

  //   this.controls.registerKey(' ', (isDown) => {
  //       if (isDown && !this.isJumping) {
  //         if (!this.isSquishing) {
  //           this.squish();
  //           this.showJumpMeter();
  //         } else {
  //           this.jump();
  //           this.hideJumpMeter();
  //         }
  //       }
  //     });
  //   */
  // }

  async initPosePrediction() {
    try {
        // Regular interval to check poses without blocking the main game loop
        setInterval(async () => {
            await this.predictMove();
        }, 1000); // Adjust interval as needed for game balance
    } catch (error) {
        console.error('Error initializing pose prediction:', error);
    }
  }  
  // Function to predict poses using the loaded model
  async predictMove(){
  //console.log(this.model!=null && this.camera!=null);
  
  if (this.model!=null && this.camera!=null) {
    //console.log(model);
    try {
      const videoElement = this.videoRef.current;
      //console.log(videoElement.readyState);
      if (videoElement && videoElement.readyState === 4) { // Ensures the video is ready to capture frames
        const { pose, posenetOutput } = await this.model.estimatePose(videoElement); // Using videoElement directly
        const prediction = await this.model.predict(posenetOutput);

        prediction.sort((a, b) => b.probability - a.probability);
        //console.log('Predictions', prediction[0], ' ', prediction[1], ' ', prediction[2], ' ', prediction[3]);
        
        // Assuming predictions[0].className holds the result from your model
        const action = prediction[0].className;

        switch (action) {
            case "Stand":
                // Code for when the model predicts "Stand"
                console.log("Standing still");
                this.movingRight = false;
                this.movingLeft = false;
                break;
            case "Squat":
                // Code for when the model predicts "Squat"
                
                if (!this.isJumping) {
                  console.log("Squatting");
                  this.squish();
                  this.showJumpMeter();
                }
                break;
            case "Jump":
                // Code for when the model predicts "Jump"
                
                if (!this.isJumping) {
                  console.log("Jumping");
                  this.jump();
                  this.hideJumpMeter();
                }
                break;
            case "walk right":
                // Code for when the model predicts "Walk Right"
                console.log("Walking left");
                this.movingLeft = true;
                
                this.lastDirection = -1;
                break;
            case "Walk Left":
                // Code for when the model predicts "Walk Left"
                console.log("Walking right");
                this.movingRight = true;
                
                this.lastDirection = 1;
                break;
            default:
                // Code for any other or unrecognized predictions
                console.log("Unknown action");
                break;
        }
      }
    } catch (error) {
      console.error('Error in predicting poses:', error);
      return null;
    }
    return null;
  }
};


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
      this.jumpsTaken++;  // Increment jumps counter
      // Use jumpMeterValue to determine vertical and horizontal jump strength
      this.verticalSpeed = -20 * this.jumpMeterValue; // Example: scale the jump strength
      this.horizontalSpeed = this.lastDirection * 7 * this.jumpMeterValue;
      this.player.clear();
      this.player.beginFill(0xFFFFFF);
      this.player.drawRect(0, 0, 50, this.originalHeight);
      this.player.endFill();
    }
  }

  // Pass playerMove into update(delta, playerMove) in Player.js and PixiGame.js
  // Before updateJumpMeter, run 'listenControls(playerMove)

  update(delta) {

    this.updateJumpMeter(delta);
    this.player.x += this.horizontalSpeed * delta; // Update position horizontally
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width  > this.app.screen.width) this.player.x = this.app.screen.width - this.player.width; 

    if (this.jumpMeter.visible) {
      // Do not allow horizontal movement when the jump meter is visible
      this.horizontalSpeed = 0;
    } else if (!this.isJumping) {
        if (this.movingLeft && this.player.x > 0) {
          this.player.x -= 5 * delta;
        }
        if (this.movingRight && this.player.x < this.app.screen.width - this.width) {
          this.player.x += 5 * delta;
        }
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
      this.horizontalSpeed = 0;
      this.verticalSpeed = 0;
    }

    this.enforceAllCollisions();

    // Adjust for minor sinking due to gravity
    if (this.onPlatform) {
      let platform = this.platforms.find(p => this.rectCollision({
          x: this.player.x, y: this.player.y, width: this.width, height: this.originalHeight
      }, {
          x: p.graphics.x, y: p.graphics.y, width: p.width, height: p.height
      }));
      if (platform) {
          this.player.y = platform.graphics.y - this.originalHeight; // Make sure player stays on top of the platform
      }
    }
    //console.log(this.onPlatform);
    if (
      this.player.y + this.player.height <= this.platforms[0].graphics.y &&
      this.player.x + this.width >= this.platforms[0].graphics.x && // player's right edge is on or past the platform's left edge
      this.player.x <= this.platforms[0].graphics.x + this.platforms[0].width) { // player's left edge is on or before the platform's right edge
      console.log("WIN");
      this.timeTaken = (Date.now() - this.timeStarted) / 1000; // Calculate time taken in seconds
      this.onPlayerWin(this.name, this.timeTaken, this.jumpsTaken);
    }

  }


  enforceAllCollisions()
  {
    //let onPlatform = false;
    let i = 0;
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
      this.rectCollision(pB, plb, i);
      i++;

    });

    //console.log(onPlatform);
    //return onPlatform;
  }
  rectCollision(a, b, i) {
    const collision = a.x + a.width > b.x && //  | box | | platform |
                      a.x < b.x + b.width && //  | platform | | box |
                      a.y + a.height > b.y &&
                      a.y < b.y + b.height;
    if (i == 9)
    {
      //console.log('Box bottom: ', a.y + a.height, 'platform top:', b.y)
    }

    if (collision) {

        // Top of a is touching bottom of b
        //a.x + a.width >= b.x &&
        //a.x <= b.x + b.width

        if (a.y + a.height > b.y &&  a.y + a.height <= b.y + 10 && a.x + a.width > b.x && a.x < b.x + b.width) {  //&& a.y <= b.y
            //console.log("Top of platform is touching bottom of square");

            this.player.y = b.y - a.height;
            this.horizontalSpeed = 0;
            this.onPlatform = true;
            this.isJumping = false;
            this.verticalSpeed = 0;
            // Only set onPlatform to true if not already on a platform to prevent flipping

        }

        // Bottom of a is touching top of b
        if (a.y < b.y + b.height && a.y + a.height > b.y + b.height) {
            //console.log("Bottom of platform is touching top of square");
            this.player.y = b.y + b.height;
            this.verticalSpeed = 0;

        }
        // This seems to work fine without platform left/right boundaries
        // Left of a is touching right of b
        if (a.x + a.width > b.x && a.x < b.x) {
            //console.log("Left of platform is touching right of square");
            // this.player.x = b.x - a.width; // Adjust player to the left side of the platform
            // this.horizontalSpeed = 0; // Stop horizontal movement

        }

        // Right of a is touching left of b
        if (a.x < b.x + b.width && a.x + a.width > b.x + b.width) {
            //console.log("Right of platform is touching left of square");
            // this.player.x = b.x + b.width; // Adjust player to the right side of the platform
            // this.horizontalSpeed = 0; // Stop horizontal movement
        }
    }else{
      //console.log('setting to false');
      //console.log("Nothing");
      this.onPlatform = false;
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
