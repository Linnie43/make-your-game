// Game settings and constants
export const config = {
    // Grid dimensions
    width: 10,
    height: 20,
    get totalCells() { return this.width * this.height; },
    miniGridSize: 16,
    displayWidth: 4,
    
    // Game mechanics
    initialInterval: 500,    // Starting drop speed (ms)
    speedUpFactor: 0.95,     // How much to speed up after line clear
    minInterval: 150,        // Fastest possible drop speed (ms)
    lockDelay: 200,          // Time before piece locks in place
    
    // Input settings
    keyRepeatDelays: { 
      'ArrowLeft': 150, 
      'ArrowRight': 150, 
      'ArrowDown': 50 
    },
    
    // Colors for tetrominoes
    colors: [
      '#ecb5ff', // Purple
      '#ffa0ab', // Pink
      '#8cffb4', // Green
      '#ff8666', // Orange
      '#80c3f5', // Blue
      '#c2e77d', // Lime
      '#fdf9a1'  // Yellow
    ]
  };
  