document.addEventListener('DOMContentLoaded', () => {
  // ===== Global Element References =====
  const grid = document.querySelector('.grid');
  const miniGrid = document.querySelector('.mini-grid');
  const scoreDisplay = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  const timerDisplay = document.getElementById('timer');
  const pauseMenu = document.getElementById('pause-menu');
  const resumeBtn = document.getElementById('resume-button');
  const restartBtn = document.getElementById('restart-button');

  // ===== Game Constants & State Variables =====
  const width = 10;
  const height = 20;
  const totalCells = width * height;
  const miniGridSize = 16; // 4x4 mini grid for next piece preview
  const colors = [ '#ecb5ff',
    '#ffa0ab',
    '#8cffb4',
    '#ff8666',
    '#80c3f5',
    '#c2e77d',
    '#fdf9a1',];
  
  let squares = [];
  let score = 0;
  let intervalTime = 500; // initial drop interval (ms)
  const speedUpFactor = 0.95; // speed up factor
  const minInterval = 150; // minimum interval time (ms)

  // Game loop and timer state
  let paused = false;
  let gameStarted = false;
  let lastTime = 0;
  let accumulator = 0;
  let elapsedSeconds = 0;
  let elapsedMinutes = 0;
  let timerInterval = null;
  
  // Attach listener to the Game Over Restart button (changed to use resetGame)
  document.getElementById('game-over-restart').addEventListener('click', resetGame);

  // ===== Grid Creation =====
  // Create main grid cells
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
  }
  // Create the "taken" row at the bottom
  for (let i = 0; i < width; i++) {
    const takenCell = document.createElement('div');
    takenCell.classList.add('taken');
    grid.appendChild(takenCell);
  }
  // Create mini-grid for next tetromino preview
  for (let i = 0; i < miniGridSize; i++) {
    const miniCell = document.createElement('div');
    miniGrid.appendChild(miniCell);
  }
  // Now select all main grid divs
  squares = Array.from(document.querySelectorAll('.grid div'));

  // ===== Timer Functions =====
  function startTimer() {
    timerInterval = setInterval(() => {
      if (!paused) {
        elapsedSeconds++;
        if (elapsedSeconds === 60) {
          elapsedMinutes++;
          elapsedSeconds = 0;
        }
        timerDisplay.textContent = `Time: ${elapsedMinutes}m ${elapsedSeconds}s`;
      }
    }, 1000);
  }

  // ===== Pause & Restart Functions =====
  function togglePause() {
    paused = !paused;
    if (paused) {
      pauseMenu.classList.remove('hidden');
    } else {
      pauseMenu.classList.add('hidden');
      // Restart the game loop if resuming
      requestAnimationFrame(gameLoop);
    }
  }

  function resetGame() {
    // Simply reload the page since no persistent variables are stored
    location.reload();
  }

  // ===== Tetromino Definitions =====
  const jTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ];

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 0],
    [width + 2, width * 2, width * 2 + 1, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2 + 2], 
    [width, width + 1, width + 2, width * 2]
  ];

  // Original Z Tetromino (unchanged)
  const sTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1]
  ];
  
  const zTetromino = [
    [1, width + 1, width, width * 2],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width + 1, width, width * 2],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ];
  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ];
  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];
  const theTetrominoes = [jTetromino, sTetromino, tTetromino, oTetromino, iTetromino, lTetromino, zTetromino];

  // ===== Current Tetromino State =====
  let currentPosition = 4;
  let currentRotation = 0;
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];
  let nextRandom = Math.floor(Math.random() * theTetrominoes.length);

  // ===== Drawing Functions =====
  function draw() {
    updateShadow(); // Update the shadow first
    current.forEach(index => {
      const cell = squares[currentPosition + index];
      cell.classList.remove('shadow'); // Remove shadow so the active tetromino appears on top
      cell.classList.add('tetromino');
      cell.style.backgroundColor = colors[random];
    });
  }

  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = '';
    });
  }

  // ===== Shadow Drawing Functions =====
  let shadowPosition = currentPosition;

  function clearShadow() {
    document.querySelectorAll('.shadow').forEach(cell => {
      cell.classList.remove('shadow');
    });
  }

  function drawShadow() {
    clearShadow(); // Ensure previous shadow is cleared
    const shadowTetromino = current.map(index => index + shadowPosition);
    shadowTetromino.forEach(index => {
      if (!squares[index].classList.contains('taken')) {
        squares[index].classList.add('shadow');
      }
    });
  }

  function updateShadow() {
    shadowPosition = currentPosition;
    while (!current.some(index => squares[shadowPosition + index + width]?.classList.contains('taken'))) {
      shadowPosition += width;
    }
    drawShadow();
  }

  // ===== Game Mechanics =====
  function hardDrop() {
    if (paused || gameOverStatus()) return; // Check if the game is over before proceeding
    
    undraw();
    clearShadow();
    // Move the piece down until a collision is detected
    while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      currentPosition += width;
    }
    draw();
    freeze();
  }

  function gameOverStatus() {
    return current.some(index => squares[currentPosition + index].classList.contains('taken'));
  }
  

  function moveDown() {
    undraw();
    const newPosition = currentPosition + width;
    if (!current.some(index => squares[newPosition + index]?.classList.contains('taken'))) {
      currentPosition = newPosition;
    }
    draw();
    freeze();
  }

  let lockDelay = 200; // Time in ms before a piece locks
  let lockTimer = null;

  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
        
        // If there's already a lock timer running, return early
        if (lockTimer) return;

        // Start a lock timer to delay the piece locking
        lockTimer = setTimeout(() => {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));

            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;

            addScore();
            spawnTetromino();

            // Reset lock timer
            lockTimer = null;
        }, lockDelay);
    }
}
  
  function spawnTetromino() {
    random = nextRandom;
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    currentRotation = 0;
    current = theTetrominoes[random][currentRotation];
    currentPosition = 4;
  
    draw();
    displayShape();
    gameOver();
  }
  

  function moveLeft() {
    undraw();
    clearShadow();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    const isBlocked = current.some(index => squares[currentPosition + index - 1]?.classList.contains('taken'));

    if (!isAtLeftEdge && !isBlocked) {
        currentPosition -= 1;
        if (lockTimer) {
            clearTimeout(lockTimer);
            lockTimer = null;
        }
    }
    
    draw();
    updateShadow();
  }

  function moveRight() {
    undraw();
    clearShadow();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    const isBlocked = current.some(index => squares[currentPosition + index + 1]?.classList.contains('taken'));

    if (!isAtRightEdge && !isBlocked) {
        currentPosition += 1;
        if (lockTimer) {
            clearTimeout(lockTimer);
            lockTimer = null;
        }
    }
    
    draw();
    updateShadow();
  }

  // Rotation with collision check
  function isRotationValid(newTetromino, position) {
    const relativeCols = newTetromino.map(offset => offset % width);
    const expectedWidth = Math.max(...relativeCols) - Math.min(...relativeCols);
    const newPositions = newTetromino.map(offset => position + offset);
    const newCols = newPositions.map(pos => pos % width);
    if (Math.max(...newCols) - Math.min(...newCols) !== expectedWidth) return false;
    for (let pos of newPositions) {
      if (pos < 0 || pos >= squares.length) return false;
      if (squares[pos].classList.contains('taken')) return false;
    }
    return true;
  }

  function rotate() {
    undraw();
    clearShadow();
    const nextRotation = (currentRotation + 1) % current.length;

    if (isRotationValid(theTetrominoes[random][nextRotation], currentPosition)) {
        currentRotation = nextRotation;
        current = theTetrominoes[random][currentRotation];

        if (lockTimer) {
            clearTimeout(lockTimer);
            lockTimer = null;
        }
    }
    
    draw();
    updateShadow();
  }

  // ===== Input Handling =====
  const keysPressed = {};
  const keyRepeatDelay = { 'ArrowLeft': 150, 'ArrowRight': 150, 'ArrowDown': 50 };
  const keyAccumulators = {
    'ArrowLeft': keyRepeatDelay['ArrowLeft'],
    'ArrowRight': keyRepeatDelay['ArrowRight'],
    'ArrowDown': keyRepeatDelay['ArrowDown']
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && !keysPressed[e.key]) {
      rotate();
    }
    keysPressed[e.key] = true;
  });

  document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
    if (keyAccumulators[e.key] !== undefined) {
      keyAccumulators[e.key] = keyRepeatDelay[e.key];
    }
  });

  function updatePlayerActions(deltaTime) {
    ['ArrowLeft', 'ArrowRight', 'ArrowDown'].forEach(key => {
      if (keysPressed[key]) {
        keyAccumulators[key] += deltaTime;
        if (keyAccumulators[key] >= keyRepeatDelay[key]) {
          if (key === 'ArrowLeft') moveLeft();
          if (key === 'ArrowRight') moveRight();
          if (key === 'ArrowDown') moveDown();
          keyAccumulators[key] = 0;
        }
      }
    });
  }

  // ===== Next Tetromino Preview =====
  const displaySquares = document.querySelectorAll('.mini-grid div');
  const displayWidth = 4;
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // L - Corrected shape for first rotation
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // S - Shape for first rotation
    [1, displayWidth, displayWidth + 1, displayWidth + 2], // T - Shape for first rotation
    [0, 1, displayWidth, displayWidth + 1], // O - Shape for first rotation
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], // I - Shape for first rotation
    [1, displayWidth + 1, displayWidth * 2 + 1, 0], // J - Shape for first rotation
    [1, displayWidth, displayWidth + 1, displayWidth * 2] // Z - Corrected shape for first rotation
  ];  

  function displayShape() {
    // Get the next tetromino for the preview from the shapes
    const nextTetromino = upNextTetrominoes[nextRandom];
    
    // Clear the mini grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
  
    // Display the next tetromino on the mini grid without the need for position adjustment
    nextTetromino.forEach(index => {
      displaySquares[index].classList.add('tetromino');
      displaySquares[index].style.backgroundColor = colors[nextRandom];
    });
  }  

  // ===== Score & Row Clearing =====
  function addScore() {
    let rowsCleared = false;
  
    for (let i = 0; i < 199; i += width) {
      const row = [...Array(width)].map((_, j) => i + j);
  
      if (row.every(index => squares[index].classList.contains('taken'))) {
        rowsCleared = true;
  
        score += 100;
        scoreDisplay.innerHTML = score;
  
        row.forEach(index => {
          squares[index].classList.remove('taken', 'tetromino');
          squares[index].style.backgroundColor = '';
        });
  
        for (let j = i; j >= width; j -= width) {
          for (let k = 0; k < width; k++) {
            squares[j + k].className = squares[j - width + k].className;
            squares[j + k].style.backgroundColor = squares[j - width + k].style.backgroundColor;
          }
        }
  
        // Ensure top row is cleared to prevent ghost blocks
        for (let k = 0; k < width; k++) {
          squares[k].classList.remove('taken', 'tetromino');
          squares[k].style.backgroundColor = '';
        }
  
        // Speed up the game
        intervalTime = Math.max(intervalTime * speedUpFactor, minInterval);
      }
    }
  
    return rowsCleared;
  }
  
  // ===== Game Over =====
  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      const gameOverEl = document.getElementById('game-over');
      gameOverEl.classList.remove('hidden'); // Show the Game Over screen
      paused = true; // Stop the game loop
    }
  }

  // ===== Game Loop =====
  function gameLoop(timestamp) {
    if (paused) {
      lastTime = timestamp;
      requestAnimationFrame(gameLoop);
      return;
    }
  
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += deltaTime;
  
    updatePlayerActions(deltaTime);
  
    while (accumulator >= intervalTime) {
      moveDown();
      accumulator -= intervalTime;
    }
    requestAnimationFrame(gameLoop);
  }
  

  startBtn.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      paused = false;
      lastTime = performance.now();
      startTimer();
      draw();
      updateShadow();
      displayShape();
      requestAnimationFrame(gameLoop);
    } else {
      togglePause();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
  });

  resumeBtn.addEventListener('click', () => {
    if (paused) {
      togglePause();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault(); // Prevent default spacebar behavior
      if (gameStarted && !paused) { // Make sure the game is started and not paused
        hardDrop();
      }
    }
    
    // Existing key detection logic
    if (e.key === 'ArrowUp' && !keysPressed[e.key]) {
      rotate();
    }
    keysPressed[e.key] = true;
  });

  restartBtn.addEventListener('click', resetGame);
});
