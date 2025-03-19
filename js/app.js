import { config } from './config.js';
import { createGameGrids } from './grid.js';
import { TetrisGame } from './game.js';
import { setupTimer, setupInputHandlers } from './ui.js';
import { displayNextShape } from './grid.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM element references (html)
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
  const game = new TetrisGame(elements, squares); // new TetrisGame instance with the DOM elements
  game.config = config;
  
  // initialize timer and input handlers
  const timer = setupTimer(elements.timerDisplay);
  const updateInputs = setupInputHandlers(game);
  
  // Listen for game over event to stop timer
  document.addEventListener('tetris-game-over', () => {
    timer.stop();
  });
  
  // handle pause states
  function togglePauseState() {
    game.togglePause();
    if (game.paused) {
      timer.pause();
    } else {
      timer.resume();
      requestAnimationFrame(timestamp => game.gameLoop(timestamp, updateInputs)); // resume game loop with current timestamp from requestAnimationFrame
    }
  }
  
  // Start/Pause button event listener
  elements.startBtn.addEventListener('click', () => {
    // first time starting the game
    if (!game.gameStarted) {
      game.gameStarted = true;
      game.paused = false;
      game.lastTime = performance.now(); // track elapsed time for game loop
      timer.start();
      game.draw();
      game.updateShadow();
      displayNextShape(Array.from(document.querySelectorAll('.mini-grid div')), game.nextRandom, config.colors);
      requestAnimationFrame(timestamp => game.gameLoop(timestamp, updateInputs)); // Start the game loop with current timestamp (gameLoop will call itself by requestAnimationFrame)
    } else if (!game.gameOver) { // Only toggle pause if not game over
      togglePauseState();
    }
  });
  
  // Escape key listener (pause)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && game.gameStarted && !game.gameOver) {
      togglePauseState();
    }
  });

  // Game over event listener to show game over menu
  document.getElementById('game-over-restart').addEventListener('click', () => game.resetGame());
  
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
});
