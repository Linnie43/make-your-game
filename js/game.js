import { config } from './config.js';
import { tetrominoes, isRotationValid } from './tetromino.js';
import { displayNextShape, clearRow } from './grid.js';

export class TetrisGame {
  // Constructor runs when a new instance of the class is created
  constructor(elements, squares) {
    // Store DOM elements
    this.elements = elements;

    // Game state (this, refers to the current instance of the class)
    this.squares = squares;
    this.score = 0;
    this.intervalTime = config.initialInterval; // drop speed
    this.paused = false;
    this.gameStarted = false;
    this.gameOver = false;
    this.lastTime = 0; // stores last timestamp for game loop
    this.accumulator = 0;
    
    // Tetromino state
    this.currentPosition = 4;
    this.currentRotation = 0; // current rotation index (0-3)
    this.random = Math.floor(Math.random() * tetrominoes.length);
    this.current = tetrominoes[this.random][this.currentRotation];
    this.nextRandom = Math.floor(Math.random() * tetrominoes.length);
    this.shadowPosition = this.currentPosition; // Initialize shadow to current position of the tetromino
  }
  
  draw() {
    this.updateShadow();
    this.current.forEach(index => {
      const cell = this.squares[this.currentPosition + index];
      cell.classList.remove('shadow');
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
  
  moveDown() {
    if (this.gameOver) return;
    
    this.undraw(); // Remove current tetromino from the grid
    const newPosition = this.currentPosition + config.width;
    if (!this.current.some(index => 
      this.squares[newPosition + index]?.classList.contains('taken'))) {
      this.currentPosition = newPosition;
    }
    this.draw();
    this.freeze();
  }
  
  moveLeft() {
    if (this.gameOver) return;

    this.undraw();
    this.clearShadow();
    // If modulo is 0 then the tetromino is at the left edge of the grid
    const isAtLeftEdge = this.current.some(index => (this.currentPosition + index) % config.width === 0);
    const isBlocked = this.current.some(index => this.squares[this.currentPosition + index - 1]?.classList.contains('taken'));
    
    if (!isAtLeftEdge && !isBlocked) {
      this.currentPosition -= 1; // Move left by decreasing the current position
    }
    this.draw();
    this.updateShadow();
  }
  
  moveRight() {
    if (this.gameOver) return;
    
    this.undraw();
    this.clearShadow();
    // If modulo is width - 1 then the tetromino is at the right edge of the grid
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
    if (this.gameOver) return;
    
    this.undraw();
    this.clearShadow();
    const nextRotation = (this.currentRotation + 1) % this.current.length; // Cycle through rotations
    
    if (isRotationValid(tetrominoes[this.random][nextRotation], this.currentPosition, this.squares)) {
      this.currentRotation = nextRotation;
      this.current = tetrominoes[this.random][this.currentRotation];
    }
    
    this.draw();
    this.updateShadow();
  }
  
  hardDrop() {
    if (this.paused || this.gameOver || this.gameOverStatus()) return;
    
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
    // If any of the indexes of the current tetromino are at the bottom or blocked by another tetromino (taken), freeze it
    if (this.current.some(index => this.squares[this.currentPosition + index + config.width].classList.contains('taken'))) {

      this.current.forEach(index => 
        this.squares[this.currentPosition + index].classList.add('taken'));
      
      this.score += 10;
      this.elements.scoreDisplay.textContent = `${this.score}`;
      
      this.addScore(); // If any rows are cleared, update the score and speed
      this.spawnTetromino();
      
    }
  }
  
  addScore() {
    const result = clearRow(this.squares, this.score, this.elements.scoreDisplay); // Clear row and update score
    
    if (result.rowsCleared) {
      this.score = result.newScore;
      this.intervalTime = Math.max(
        this.intervalTime * config.speedUpFactor, 
        config.minInterval
      );
    }
  }
  
  spawnTetromino() {
    this.random = this.nextRandom;
    this.nextRandom = Math.floor(Math.random() * tetrominoes.length);
    this.currentRotation = 0;
    this.current = tetrominoes[this.random][this.currentRotation];
    this.currentPosition = 4;
    
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
      this.squares[this.currentPosition + index].classList.contains('taken'));
  }
  
  checkGameOver() {
    if (this.gameOverStatus()) {
      const gameOverEl = document.getElementById('game-over');
      gameOverEl.classList.remove('hidden');
      this.paused = true;
      this.gameOver = true; // Set game over flag
      
      // New event for game over for other listeners
      document.dispatchEvent(new CustomEvent('tetris-game-over'));
    }
  }
  
  togglePause() {
    if (this.gameOver) return;
    
    this.paused = !this.paused;
    if (this.paused) {
      this.elements.pauseMenu.classList.remove('hidden');
    } else {
      this.elements.pauseMenu.classList.add('hidden');
    }
  }

  resetGame() {
    location.reload();
  }
  
  gameLoop(timestamp, updateInputs) {
    if (this.paused || this.gameOver) {
      this.lastTime = timestamp;
      if (!this.gameOver) {
        requestAnimationFrame(time => this.gameLoop(time, updateInputs)); // "Schedule" the next frame with requestAnimationFrame
      }
      return; // Exit the loop if paused or game over
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
