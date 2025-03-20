export function setupTimer(timerDisplay) {
    let elapsedSeconds = 0;
    let elapsedMinutes = 0;
    let timerInterval = null;
    let isPaused = false;
    
    function startTimer() {
      timerInterval = setInterval(() => {
        if (!isPaused) {
          elapsedSeconds++;
          if (elapsedSeconds === 60) {
            elapsedMinutes++;
            elapsedSeconds = 0;
          }
          updateDisplay();
        }
      }, 1000);
    }
    
    function updateDisplay() {
      timerDisplay.textContent = `Time: ${elapsedMinutes}m ${elapsedSeconds}s`;
    }
    
    function pauseTimer() {
      isPaused = true;
    }
    
    function resumeTimer() {
      isPaused = false;
    }
    
    function stopTimer() {
      clearInterval(timerInterval);
    }
    
    function resetTimer() {
      stopTimer();
      elapsedSeconds = 0;
      elapsedMinutes = 0;
      updateDisplay();
    }
    
    return {
      start: startTimer,
      pause: pauseTimer,
      resume: resumeTimer,
      stop: stopTimer,
      reset: resetTimer,
      isPaused: () => isPaused,
      setIsPaused: (state) => { isPaused = state; }
    };
  }
  
  export function setupInputHandlers(game) {
    const keysPressed = {}; // Keep track of pressed keys
    const { keyRepeatDelays } = game.config; // Get key repeat delays from game config
    
    const keyAccumulators = { // Keeps track of accumulated time for each key press
      'ArrowLeft': keyRepeatDelays['ArrowLeft'],
      'ArrowRight': keyRepeatDelays['ArrowRight'],
      'ArrowDown': keyRepeatDelays['ArrowDown']
    };
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && !keysPressed[e.key] && game.gameStarted && !game.paused) {
        game.rotate();
      }
      if ((e.key === ' ' || e.code === 'Space') && game.gameStarted) {
        e.preventDefault();
        game.hardDrop();
      }
      keysPressed[e.key] = true;
      
    });
    
    document.addEventListener('keyup', (e) => {
      keysPressed[e.key] = false;
      if (keyAccumulators[e.key] !== undefined) {
        keyAccumulators[e.key] = keyRepeatDelays[e.key];
      }
    });
    
    return function updatePlayerActions(deltaTime) { // Delta time is the time since the last frame
      if (game.gameOver || game.paused) return;
      
      ['ArrowLeft', 'ArrowRight', 'ArrowDown'].forEach(key => {
        if (keysPressed[key]) {
          keyAccumulators[key] += deltaTime;
          if (keyAccumulators[key] >= keyRepeatDelays[key]) {
            if (key === 'ArrowLeft') game.moveLeft();
            if (key === 'ArrowRight') game.moveRight();
            if (key === 'ArrowDown') game.moveDown();
            keyAccumulators[key] = 0;
          }
        }
      });
    };
  }
  