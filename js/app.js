import { config } from './config.js';
import { createGameGrids } from './grid.js';
import { TetrisGame } from './game.js';
import { setupTimer, setupInputHandlers } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM element references
  const elements = {
    grid: document.querySelector('.grid'),
    miniGrid: document.querySelector('.mini-grid'),
    scoreDisplay: document.querySelector('#score'),
    startBtn: document.querySelector('#start-button'),
    timerDisplay: document.getElementById('timer'),
    pauseMenu: document.getElementById('pause-menu'),
    resumeBtn: document.getElementById('resume-button'),
    restartBtn: document.getElementById('restart-button')
  };
  
  // Create the game grid
  const squares = createGameGrids(elements.grid, elements.miniGrid);
  
  // Initialize the game
  const game = new TetrisGame(elements);
  game.config = config; // Attach config to game for use in input handler
  game.initializeGame(squares);
  
  // Set up timer
  const timer = setupTimer(elements.timerDisplay);
  
  // Set up input handlers
  const updateInputs = setupInputHandlers(game);
  
  // Listen for game over event to stop timer
  document.addEventListener('tetris-game-over', () => {
    timer.stop(); // Stop the timer when game is over
  });
  
  // Centralized function to handle pause/resume state
  function togglePauseState() {
    game.togglePause();
    if (game.paused) {
      timer.pause();
    } else {
      timer.resume();
      requestAnimationFrame(timestamp => game.gameLoop(timestamp, updateInputs));
    }
  }
  
  // Start/Pause button event listener
  elements.startBtn.addEventListener('click', () => {
    if (!game.gameStarted) {
      // First time starting the game
      game.gameStarted = true;
      game.paused = false;
      game.lastTime = performance.now();
      timer.start();
      game.draw();
      game.updateShadow();
      displayNextShape();
      requestAnimationFrame(timestamp => game.gameLoop(timestamp, updateInputs));
    } else if (!game.gameOver) { // Only toggle pause if not game over
      // Toggle pause state
      togglePauseState();
    }
  });
  
  // Escape key listener - THE ONLY ESC KEY HANDLER
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && game.gameStarted && !game.gameOver) {
      togglePauseState();
    }
  });
  
  // Resume button listener
  elements.resumeBtn.addEventListener('click', () => {
    if (game.paused && !game.gameOver) {
      togglePauseState();
    }
  });
  
  // Restart button listener
  elements.restartBtn.addEventListener('click', () => {
    game.resetGame();
  });
  
  // Helper function to display the next shape
  function displayNextShape() {
    import('./grid.js').then(({ displayNextShape }) => {
      displayNextShape(
        Array.from(document.querySelectorAll('.mini-grid div')),
        game.nextRandom,
        config.colors
      );
    });
  }
});
