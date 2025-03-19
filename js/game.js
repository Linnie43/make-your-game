import { config } from './config.js';
import { tetrominoes, isRotationValid } from './tetromino.js';
import { displayNextShape, clearRow } from './grid.js';
// class = blueprint for creating objects (grouping related data and functions)
export class TetrisGame {
  // constructor runs when a new instance of the class is created
  constructor(elements, squares) {
    // Store DOM elements
    this.elements = elements;

    // Game state (this, refers to the current instance of the class)
    this.squares = squares;
    this.score = 0; // current score
    this.intervalTime = config.initialInterval; // drop speed
    this.paused = false;
    this.gameStarted = false;
    this.gameOver = false;
    this.lastTime = 0; // stores last timestamp for game loop
    this.accumulator = 0;
    
    // Tetromino state
    this.currentPosition = 4;
    this.currentRotation = 0; // current rotation index (0-3)
    this.random = Math.floor(Math.random() * tetrominoes.length); // random tetromino index
    this.current = tetrominoes[this.random][this.currentRotation]; // current tetromino shape from tetrominoes array
    this.nextRandom = Math.floor(Math.random() * tetrominoes.length);
    this.shadowPosition = this.currentPosition;
  }
  
  // Tetromino drawing functions
  draw() {
    this.updateShadow(); // Update the shadow first
    this.current.forEach(index => { // indexes where all the blocks will be drawn
      const cell = this.squares[this.currentPosition + index];
      cell.classList.remove('shadow'); // if shadow is in the next position, remove
      cell.classList.add('tetromino');
      cell.style.backgroundColor = config.colors[this.random];
    });
  }
  
  undraw() {
    this.current.forEach(index => {
      this.squares[this.currentPosition + index].classList.remove('tetromino');
      this.squares[this.currentPosition + index].style.backgroundColor = '';
    });
  }
  
  // Shadow functions
  clearShadow() {
    document.querySelectorAll('.shadow').forEach(cell => {
      cell.classList.remove('shadow');
    });
  }
  
  drawShadow() {
    this.clearShadow();
    const shadowTetromino = this.current.map(index => index + this.shadowPosition);
    shadowTetromino.forEach(index => {
      if (!this.squares[index].classList.contains('taken')) {
        this.squares[index].classList.add('shadow');
      }
    });
  }
  
  updateShadow() {
    this.shadowPosition = this.currentPosition;
    while (!this.current.some(index => 
      this.squares[this.shadowPosition + index + config.width]?.classList.contains('taken'))) {
      this.shadowPosition += config.width;
    }
    this.drawShadow();
  }
  
  // Movement functions
  moveDown() {
    if (this.gameOver) return; // Prevent movement if game over
    
    this.undraw(); // remove current tetromino from the grid
    const newPosition = this.currentPosition + config.width;
    if (!this.current.some(index => 
      this.squares[newPosition + index]?.classList.contains('taken'))) {
      this.currentPosition = newPosition;
    }
    this.draw();
    this.freeze();
  }
  
  moveLeft() {
    if (this.gameOver) return; // Prevent movement if game over
    // remove the current tetromino from the grid and the shadow
    this.undraw();
    this.clearShadow();
    // if the tetromino is at the left edge or blocked by another tetromino, don't move
    const isAtLeftEdge = this.current.some(index => (this.currentPosition + index) % config.width === 0); // if modulo width is 0, it's at the left edge
    const isBlocked = this.current.some(index => this.squares[this.currentPosition + index - 1]?.classList.contains('taken'));
    
    if (!isAtLeftEdge && !isBlocked) {
      this.currentPosition -= 1; // move left by decreasing the current position
    }
    
    this.draw();
    this.updateShadow();
  }
  
  moveRight() {
    if (this.gameOver) return; // Prevent movement if game over
    
    this.undraw();
    this.clearShadow();
    const isAtRightEdge = this.current.some(index => 
      (this.currentPosition + index) % config.width === config.width - 1);
    const isBlocked = this.current.some(index => 
      this.squares[this.currentPosition + index + 1]?.classList.contains('taken'));
    
    if (!isAtRightEdge && !isBlocked) {
      this.currentPosition += 1;
    }
    
    this.draw();
    this.updateShadow();
  }
  
  rotate() {
    if (this.gameOver) return; // Prevent rotation if game over
    
    this.undraw();
    this.clearShadow();
    const nextRotation = (this.currentRotation + 1) % this.current.length; // cycle through rotations
    
    // if the next rotation is valid (not blocked by walls or other tetrominoes), update the current rotation and tetromino
    if (isRotationValid(tetrominoes[this.random][nextRotation], this.currentPosition, this.squares)) {
      this.currentRotation = nextRotation;
      this.current = tetrominoes[this.random][this.currentRotation];
    }
    
    this.draw();
    this.updateShadow();
  }
  
  hardDrop() {
    if (this.paused || this.gameOver || this.gameOverStatus()) return; // no hard drop if pause or game over
    
    this.undraw();
    this.clearShadow();
    // Move the piece down until a collision is detected
    while (!this.current.some(index => 
      this.squares[this.currentPosition + index + config.width].classList.contains('taken'))) {
      this.currentPosition += config.width;
    }
    this.draw();
    this.freeze();
  }
  
  freeze() {
    // if any of the indexes of the current tetromino are at the bottom or blocked by another tetromino (taken), freeze it
    if (this.current.some(index => this.squares[this.currentPosition + index + config.width].classList.contains('taken'))) {

      // add the current tetromino to the grid as "taken"
      this.current.forEach(index => 
        this.squares[this.currentPosition + index].classList.add('taken'));
      
      this.score += 10;
      this.elements.scoreDisplay.textContent = `${this.score}`;
      
      this.addScore(); // if any rows are cleared, update the score and speed
      this.spawnTetromino();
      
    }
  }
  
  addScore() {
    const result = clearRow(this.squares, this.score, this.elements.scoreDisplay); // clear rows and update score
    
    if (result.rowsCleared) {
      this.score = result.newScore;
      // Speed up the game
      this.intervalTime = Math.max(
        this.intervalTime * config.speedUpFactor, 
        config.minInterval
      );
    }
  }
  
  spawnTetromino() {
    this.random = this.nextRandom; // current piece will be the next piece
    this.nextRandom = Math.floor(Math.random() * tetrominoes.length); // next piece gets randomly selected
    this.currentRotation = 0; // rotation should be 0
    this.current = tetrominoes[this.random][this.currentRotation]; // get the new current tetromino shape
    this.currentPosition = 4; // reset position to the top of the grid
    
    this.draw();
    displayNextShape(
      Array.from(document.querySelectorAll('.mini-grid div')), 
      this.nextRandom, 
      config.colors
    );
    this.checkGameOver();
  }
  
  gameOverStatus() {
    return this.current.some(index => 
      this.squares[this.currentPosition + index].classList.contains('taken')); // when the tetromino is at the top, if any part of it is taken, game over
  }
  
  checkGameOver() {
    if (this.gameOverStatus()) {
      const gameOverEl = document.getElementById('game-over'); // Get the game over element
      gameOverEl.classList.remove('hidden'); // remove the hidden class to show game over menu
      this.paused = true;
      this.gameOver = true; // Set game over flag
      
      // Dispatch custom event for game over for other listeners
      document.dispatchEvent(new CustomEvent('tetris-game-over'));
    }
  }
  
  togglePause() {
    // Don't allow toggling pause if game is over
    if (this.gameOver) return;
    
    this.paused = !this.paused;
    if (this.paused) {
      this.elements.pauseMenu.classList.remove('hidden');
    } else {
      this.elements.pauseMenu.classList.add('hidden');
    }
  }

  // Reset the game by reloading the page
  resetGame() {
    location.reload();
  }
  
  gameLoop(timestamp, updateInputs) {
    if (this.paused || this.gameOver) {
      this.lastTime = timestamp;
      if (!this.gameOver) { // Only continue loop if not game over
        requestAnimationFrame(time => this.gameLoop(time, updateInputs));
      }
      return;
    }
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += deltaTime;
    
    updateInputs(deltaTime);
    
    while (this.accumulator >= this.intervalTime) {
      this.moveDown();
      this.accumulator -= this.intervalTime;
    }
    
    requestAnimationFrame(time => this.gameLoop(time, updateInputs));
  }
}
