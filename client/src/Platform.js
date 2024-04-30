// Platform.js
import * as PIXI from 'pixi.js';

export default class Platform {
  constructor(app, x, y, width, height) {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0x8B4513); // A brown color for the platforms
    this.graphics.drawRect(0, 0, width, height);
    this.graphics.endFill();
    // Set the position of the graphics object
    this.graphics.x = x;
    this.graphics.y = y;
    

    // Store width and height for collision detection
    this.width = width;
    this.height = height;
    app.stage.addChild(this.graphics);
  }
}
