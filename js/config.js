export const config = {
    // Grid dimensions
    width: 10,
    height: 20,
    get totalCells() { return this.width * this.height; }, // total number of cells, calculate dynamically
    miniGridSize: 16,
    displayWidth: 4,
 
    initialInterval: 500, // Starting drop speed
    speedUpFactor: 0.97, // Speed up by line clear
    minInterval: 150, // Fastest drop speed
    
    // Input
    keyRepeatDelays: { // Delays for key repeat actions
      'ArrowLeft': 150, 
      'ArrowRight': 150, 
      'ArrowDown': 50 
    },
    
    // Colors
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
  