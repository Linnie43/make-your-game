import { config } from './config.js';

export function createGameGrids(grid, miniGrid) {
  for (let i = 0; i < config.totalCells; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
  }
  
  // Create the "taken" row at the bottom
  for (let i = 0; i < config.width; i++) {
    const takenCell = document.createElement('div');
    takenCell.classList.add('taken');
    grid.appendChild(takenCell);
  }

  for (let i = 0; i < config.miniGridSize; i++) {
    const miniCell = document.createElement('div');
    miniGrid.appendChild(miniCell);
  }
  
  return Array.from(document.querySelectorAll('.grid div'));
}

export function displayNextShape(displaySquares, nextRandom, colors) {
  // Executes when import is done
  import('./tetromino.js').then(({ previewTetrominoes }) => {
    // Clear the mini grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
    
    // Display the next tetromino
    const nextTetromino = previewTetrominoes[nextRandom];
    nextTetromino.forEach(index => {
      displaySquares[index].classList.add('tetromino');
      displaySquares[index].style.backgroundColor = colors[nextRandom];
    });
  });
}

export function clearRow(squares, score, scoreDisplay) {
  let rowsCleared = false;
  let newScore = score;

  // Check each row for completion
  for (let i = 0; i < 199; i += config.width) {
    // Row is an array of indices for the current row (ie, 0-9, 10-19, etc.)
    const row = [...Array(config.width)].map((_, j) => i + j);
    
    if (row.every(index => squares[index].classList.contains('taken'))) {
      rowsCleared = true;
      
      newScore += 100;
      scoreDisplay.innerHTML = newScore;
      
      row.forEach(index => {
        squares[index].classList.remove('taken', 'tetromino');
        squares[index].style.backgroundColor = '';
      });
      
      // Shift down all remaining rows above the cleared row
      for (let j = i; j >= config.width; j -= config.width) {
        for (let k = 0; k < config.width; k++) {
          squares[j + k].className = squares[j - config.width + k].className;
          squares[j + k].style.backgroundColor = squares[j - config.width + k].style.backgroundColor;
        }
      }
    }
  }
  
  return { rowsCleared, newScore };
}
