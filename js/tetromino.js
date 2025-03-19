import { config } from './config.js';

const { width } = config;

// Tetromino definitions
export const jTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2]
];

export const lTetromino = [
  [1, width + 1, width * 2 + 1, 0],
  [width + 2, width * 2, width * 2 + 1, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2 + 2],
  [width, width + 1, width + 2, width * 2]
];

export const sTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1]
];

export const zTetromino = [
  [1, width + 1, width, width * 2],
  [width, width + 1, width * 2 + 1, width * 2 + 2],
  [1, width + 1, width, width * 2],
  [width, width + 1, width * 2 + 1, width * 2 + 2]
];

export const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1]
];

export const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1]
];

export const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3]
];

export const tetrominoes = [
  jTetromino, sTetromino, tTetromino, oTetromino, iTetromino, lTetromino, zTetromino
];

// Shapes for the preview grid
export const previewTetrominoes = [
  [1, config.displayWidth + 1, config.displayWidth * 2 + 1, 2], // J
  [1, config.displayWidth + 1, config.displayWidth + 2, config.displayWidth * 2 + 2], // S
  [1, config.displayWidth, config.displayWidth + 1, config.displayWidth + 2], // T
  [1, 2, config.displayWidth + 1, config.displayWidth + 2], // O
  [1, config.displayWidth + 1, config.displayWidth * 2 + 1, config.displayWidth * 3 + 1], // I
  [2, config.displayWidth + 2, config.displayWidth * 2 + 2, 1], // L
  [2, config.displayWidth + 1, config.displayWidth + 2, config.displayWidth * 2 + 1] // Z
];

// Check if a rotation is valid
export function isRotationValid(newTetromino, position, squares) {
  // first check that offset is within the grid (offset = position % config.width)
  const relativeCols = newTetromino.map(offset => offset % config.width);
  // find horizontal width of the tetromino
  const expectedWidth = Math.max(...relativeCols) - Math.min(...relativeCols);
  // adds each offset to position, determining where each block will land in the 1D grid after rotation.
  const newPositions = newTetromino.map(offset => position + offset);
  // converts each new position into a column index.
  const newCols = newPositions.map(pos => pos % config.width);
  // if it exceeds the grid width, return false (new row)
  if (Math.max(...newCols) - Math.min(...newCols) !== expectedWidth) return false;
  
  for (let pos of newPositions) {
    if (pos < 0 || pos >= squares.length) return false; // out of bounds
    if (squares[pos].classList.contains('taken')) return false; // already taken
  }
  
  return true;
}
