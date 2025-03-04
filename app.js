document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  let squares = Array.from(document.querySelectorAll('.grid div'));
  const scoreDisplay = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  const width = 10;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  const colors = ['orange', 'red', 'purple', 'green', 'blue'];
  
  let intervalTime = 250; // Start with a slower speed (250ms per drop)
  const speedUpFactor = 0.98; // Slow down the speed-up effect (only 2% increase per row cleared)
  const minInterval = 150; // Minimum limit for interval time

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

  let currentPosition = 4;
  let currentRotation = 0;

  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

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

  function moveDown() {
      undraw();
      currentPosition += width;
      draw();
      freeze();
  }

  function freeze() {
      if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
          current.forEach(index => squares[currentPosition + index].classList.add('taken'));
          random = nextRandom;
          nextRandom = Math.floor(Math.random() * theTetrominoes.length);
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
      current = theTetrominoes[random][currentRotation];
      draw();
  }

  // Long Press Support
  const keysPressed = {};
  let repeatIntervals = {};

  function startRepeatingAction(key, action, delay = 100) {
      if (!repeatIntervals[key]) {
          action();
          repeatIntervals[key] = setInterval(action, delay);
      }
  }

  function stopRepeatingAction(key) {
      if (repeatIntervals[key]) {
          clearInterval(repeatIntervals[key]);
          delete repeatIntervals[key];
      }
  }

  function control(e) {
      if (!keysPressed[e.key]) {
          keysPressed[e.key] = true;
          if (e.key === 'ArrowLeft') {
              startRepeatingAction(e.key, moveLeft);
          } else if (e.key === 'ArrowRight') {
              startRepeatingAction(e.key, moveRight);
          } else if (e.key === 'ArrowDown') {
              startRepeatingAction(e.key, moveDown, 50);
          } else if (e.key === 'ArrowUp') {
              rotate();
          }
      }
  }

  function stopControl(e) {
      keysPressed[e.key] = false;
      stopRepeatingAction(e.key);
  }

  document.addEventListener('keydown', control);
  document.addEventListener('keyup', stopControl);

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

  startBtn.addEventListener('click', () => {
      if (timerId) {
          clearInterval(timerId);
          timerId = null;
      } else {
          draw();
          timerId = setInterval(moveDown, intervalTime);
          nextRandom = Math.floor(Math.random() * theTetrominoes.length);
          displayShape();
      }
  });

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

            squares = [...squares.splice(i, width), ...squares];
            squares.forEach(cell => grid.appendChild(cell));

            // Correctly apply speed-up factor here
            clearInterval(timerId);
            intervalTime = Math.max(intervalTime * speedUpFactor, minInterval);
            timerId = setInterval(moveDown, intervalTime); // Restart with new speed
        }
    }
}


  function gameOver() {
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
          scoreDisplay.innerHTML = 'end';
          clearInterval(timerId);
      }
  }
});
