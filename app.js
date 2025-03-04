document.addEventListener('DOMContentLoaded', () => {
    // Basic Setup
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const width = 10;
    let score = 0;
    const colors = ['orange', 'red', 'purple', 'green', 'blue'];
  
    // Timing & Speed Settings
    let intervalTime = 250; // initial drop interval (ms)
    const speedUpFactor = 0.98; // speed increases by 2% per cleared row
    const minInterval = 150; // lowest interval value
  
    // Tetromino definitions
    const lTetromino = [
      [1, width+1, width*2+1, 2],
      [width, width+1, width+2, width*2+2],
      [1, width+1, width*2+1, width*2],
      [width, width*2, width*2+1, width*2+2]
    ];
    const zTetromino = [
      [0, width, width+1, width*2+1],
      [width+1, width+2, width*2, width*2+1],
      [0, width, width+1, width*2+1],
      [width+1, width+2, width*2, width*2+1]
    ];
    const tTetromino = [
      [1, width, width+1, width+2],
      [1, width+1, width+2, width*2+1],
      [width, width+1, width+2, width*2+1],
      [1, width, width+1, width*2+1]
    ];
    const oTetromino = [
      [0, 1, width, width+1],
      [0, 1, width, width+1],
      [0, 1, width, width+1],
      [0, 1, width, width+1]
    ];
    const iTetromino = [
      [1, width+1, width*2+1, width*3+1],
      [width, width+1, width+2, width+3],
      [1, width+1, width*2+1, width*3+1],
      [width, width+1, width+2, width+3]
    ];
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  
    // Current Tetromino State
    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let nextRandom = Math.floor(Math.random() * theTetrominoes.length);
  
    // Draw and Undraw Functions
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino');
        squares[currentPosition + index].style.backgroundColor = colors[random];
      });
    }
  
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino');
        squares[currentPosition + index].style.backgroundColor = '';
      });
    }

    function adjustRotationPosition() {
      // While any block of the tetromino is off the left edge, move it right.
      while (current.some(index => (currentPosition + index) % width < 0)) {
        currentPosition++;
      }
      // While any block of the tetromino is off the right edge, move it left.
      while (current.some(index => (currentPosition + index) % width >= width)) {
        currentPosition--;
      }
    }
  
    // Game Mechanics
    function moveDown() {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }
  
    function freeze() {
      if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'));
        // Spawn the next tetromino
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        currentRotation = 0;
        current = theTetrominoes[random][currentRotation];
        currentPosition = 4;
        draw();
        displayShape();
        addScore();
        gameOver();
      }
    }
  
    function moveLeft() {
      undraw();
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
      if (!isAtLeftEdge) currentPosition -= 1;
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition += 1;
      }
      draw();
    }
  
    function moveRight() {
      undraw();
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
      if (!isAtRightEdge) currentPosition += 1;
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -= 1;
      }
      draw();
    }
  
    function rotate() {
      undraw();
      currentRotation++;
      if (currentRotation === current.length) currentRotation = 0;
      // Get the new rotation configuration
      current = theTetrominoes[random][currentRotation];
      
      // Adjust the piece so that it doesn't go off the grid edges.
      adjustRotationPosition();
      
      // Only draw the tetromino if the new position is valid
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        // If overlap occurs, you might choose to cancel rotation or handle it differently.
        currentRotation--;
        if (currentRotation < 0) currentRotation = current.length - 1;
        current = theTetrominoes[random][currentRotation];
        adjustRotationPosition();
      }
      draw();
    }
    
  
    // Pause/Resume and Game Loop Setup
    let paused = false;
    let gameStarted = false;
    let lastTime = 0;
    let accumulator = 0;
  
    // Main Game Loop using requestAnimationFrame
    function gameLoop(timestamp) {
      if (paused) {
        lastTime = timestamp; // Reset to avoid huge deltaTime after pause
        requestAnimationFrame(gameLoop);
        return;
      }
      if (!lastTime) lastTime = timestamp;
      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      accumulator += deltaTime;
  
      // Process continuous input actions
      updatePlayerActions(deltaTime);
  
      // Update the game state if enough time has passed
      while (accumulator >= intervalTime) {
        moveDown();
        accumulator -= intervalTime;
      }
  
      requestAnimationFrame(gameLoop);
    }
  
    // Key Input Handling for Smooth, Continuous Movement
    const keysPressed = {};
    // Set repeat delays (in ms) for continuous actions
    const keyRepeatDelay = { 'ArrowLeft': 150, 'ArrowRight': 150, 'ArrowDown': 50 };
    const keyAccumulators = {
      'ArrowLeft': keyRepeatDelay['ArrowLeft'],
      'ArrowRight': keyRepeatDelay['ArrowRight'],
      'ArrowDown': keyRepeatDelay['ArrowDown']
    };
  
    document.addEventListener('keydown', (e) => {
      // For rotation, trigger only once per key press
      if (e.key === 'ArrowUp') {
        if (!keysPressed[e.key]) {
          rotate();
        }
      }
      keysPressed[e.key] = true;
    });
  
    document.addEventListener('keyup', (e) => {
      keysPressed[e.key] = false;
      if (keyAccumulators[e.key] !== undefined) {
        keyAccumulators[e.key] = keyRepeatDelay[e.key];
      }
    });
  
    // Update player actions based on keys held down
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
  
    // Next Tetromino Display (Mini-grid)
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;
    const upNextTetrominoes = [
      [1, displayWidth+1, displayWidth*2+1, 2],
      [0, displayWidth, displayWidth+1, displayWidth*2+1],
      [1, displayWidth, displayWidth+1, displayWidth+2],
      [0, 1, displayWidth, displayWidth+1],
      [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]
    ];
  
    function displayShape() {
      displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
      });
      upNextTetrominoes[nextRandom].forEach(index => {
        displaySquares[displayIndex + index].classList.add('tetromino');
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
      });
    }
  
    // Score and Row Clearing
    function addScore() {
      for (let i = 0; i < 199; i += width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
        if (row.every(index => squares[index].classList.contains('taken'))) {
          score += 10;
          scoreDisplay.innerHTML = score;
          row.forEach(index => {
            squares[index].classList.remove('taken');
            squares[index].classList.remove('tetromino');
            squares[index].style.backgroundColor = '';
          });
          // Reorder the grid squares to simulate row removal
          squares = [...squares.splice(i, width), ...squares];
          squares.forEach(cell => grid.appendChild(cell));
          // Increase game speed, but cap it at minInterval
          intervalTime = Math.max(intervalTime * speedUpFactor, minInterval);
        }
      }
    }
  
    // Game Over Condition
    function gameOver() {
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end';
        paused = true; // Halts the game loop
      }
    }
  
    // Start/Pause Button Logic
    startBtn.addEventListener('click', () => {
      if (!gameStarted) {
        gameStarted = true;
        paused = false;
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
      } else {
        // Toggle between pause and resume
        paused = !paused;
      }
    });
  
  });
  