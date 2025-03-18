import { config } from './config.js';

export function createGameGrids(grid, miniGrid) {
  // Create main grid cells
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
  
  // Create mini-grid for next tetromino preview
  for (let i = 0; i < config.miniGridSize; i++) {
    const miniCell = document.createElement('div');
    miniGrid.appendChild(miniCell);
  }
  
  // Return all grid cells as an array
  return Array.from(document.querySelectorAll('.grid div'));
}

export function displayNextShape(displaySquares, nextRandom, colors) {
  // Import done within the function to avoid circular dependencies
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
  
  for (let i = 0; i < 199; i += config.width) {
    const row = [...Array(config.width)].map((_, j) => i + j);
    
    if (row.every(index => squares[index].classList.contains('taken'))) {
      rowsCleared = true;
      
      newScore += 100;
      scoreDisplay.innerHTML = newScore;
      
      row.forEach(index => {
        squares[index].classList.remove('taken', 'tetromino');
        squares[index].style.backgroundColor = '';
      });
      
      for (let j = i; j >= config.width; j -= config.width) {
        for (let k = 0; k < config.width; k++) {
          squares[j + k].className = squares[j - config.width + k].className;
          squares[j + k].style.backgroundColor = squares[j - config.width + k].style.backgroundColor;
        }
      }
      
      // Ensure top row is cleared to prevent ghost blocks
      for (let k = 0; k < config.width; k++) {
        squares[k].classList.remove('taken', 'tetromino');
        squares[k].style.backgroundColor = '';
      }
    }
  }
  
  return { rowsCleared, newScore };
}
