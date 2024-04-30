// Controls.js
class Controls {
    constructor() {
      this.keysPressed = {};
      this.callbacks = {};
      this.boundOnKeyDown = (e) => this.onKeyDown(e);
      this.boundOnKeyUp = (e) => this.onKeyUp(e);
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      window.addEventListener('keydown', this.boundOnKeyDown);
      window.addEventListener('keyup', this.boundOnKeyUp);
    }
  
    onKeyDown(e) {
      const key = e.key.toLowerCase();
      if (!this.keysPressed[key]) {
        this.keysPressed[key] = true;
        if (this.callbacks[key]) {
          this.callbacks[key].forEach(callback => callback(true));
        }
      }
    }
  
    onKeyUp(e) {
      const key = e.key.toLowerCase();
      if (this.keysPressed[key]) {
        delete this.keysPressed[key];
        if (this.callbacks[key]) {
          this.callbacks[key].forEach(callback => callback(false));
        }
      }
    }
  
    registerKey(key, callback) {
      const lowerKey = key.toLowerCase();
      if (!this.callbacks[lowerKey]) {
        this.callbacks[lowerKey] = [];
      }
      this.callbacks[lowerKey].push(callback);
    }
  
    destroy() {
      window.removeEventListener('keydown', this.boundOnKeyDown);
      window.removeEventListener('keyup', this.boundOnKeyUp);
    }
  }
  
  export default Controls;
  