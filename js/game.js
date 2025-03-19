import { config } from './config.js';
import { tetrominoes, isRotationValid } from './tetromino.js';
import { displayNextShape, clearRow } from './grid.js';

export class TetrisGame {
  constructor(elements) {
    // Store DOM elements
    this.elements = elements;
    
    // Game state
    this.squares = [];
    this.score = 0;
    this.intervalTime = config.initialInterval;
    this.paused = false;
    this.gameStarted = false;
    this.gameOver = false; // Flag specifically for game over state
    this.lastTime = 0;
    this.accumulator = 0;
    this.lockTimer = null;
    
    // Tetromino state
    this.currentPosition = 4;
    this.currentRotation = 0;
    this.random = Math.floor(Math.random() * tetrominoes.length);
    this.current = tetrominoes[this.random][this.currentRotation];
    this.nextRandom = Math.floor(Math.random() * tetrominoes.length);
    this.shadowPosition = this.currentPosition;
  }
  
  initializeGame(squares) {
    this.squares = squares;
    
    // Set up game over restart button
    document.getElementById('game-over-restart').addEventListener('click', 
      () => this.resetGame());
  }
  
  // Tetromino drawing functions
  draw() {
    this.updateShadow(); // Update the shadow first
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
    
    this.undraw();
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
    
    this.undraw();
    this.clearShadow();
    const isAtLeftEdge = this.current.some(index => 
      (this.currentPosition + index) % config.width === 0);
    const isBlocked = this.current.some(index => 
      this.squares[this.currentPosition + index - 1]?.classList.contains('taken'));
    
    if (!isAtLeftEdge && !isBlocked) {
      this.currentPosition -= 1;
      if (this.lockTimer) {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
      }
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
      if (this.lockTimer) {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
      }
    }
    
    this.draw();
    this.updateShadow();
  }
  
  rotate() {
    if (this.gameOver) return; // Prevent rotation if game over
    
    this.undraw();
    this.clearShadow();
    const nextRotation = (this.currentRotation + 1) % this.current.length;
    
    if (isRotationValid(tetrominoes[this.random][nextRotation], 
                        this.currentPosition, 
                        this.squares)) {
      this.currentRotation = nextRotation;
      this.current = tetrominoes[this.random][this.currentRotation];
      
      if (this.lockTimer) {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
      }
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
    if (this.current.some(index => 
      this.squares[this.currentPosition + index + config.width].classList.contains('taken'))) {
      
      // If there's already a lock timer running, return early
      if (this.lockTimer) return;
      
      // Start a lock timer to delay the piece locking
      this.lockTimer = setTimeout(() => {
        this.current.forEach(index => 
          this.squares[this.currentPosition + index].classList.add('taken'));
        
        this.score += 10;
        this.elements.scoreDisplay.textContent = `${this.score}`;
        
        this.addScore();
        this.spawnTetromino();
        
        // Reset lock timer
        this.lockTimer = null;
      }, config.lockDelay);
    }
  }
  
  addScore() {
    const result = clearRow(this.squares, this.score, this.elements.scoreDisplay);
    
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
      
      // Dispatch custom event for game over
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
