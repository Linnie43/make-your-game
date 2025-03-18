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
  [0, config.displayWidth, config.displayWidth + 1, config.displayWidth * 2 + 1], // S
  [1, config.displayWidth, config.displayWidth + 1, config.displayWidth + 2], // T
  [0, 1, config.displayWidth, config.displayWidth + 1], // O
  [1, config.displayWidth + 1, config.displayWidth * 2 + 1, config.displayWidth * 3 + 1], // I
  [1, config.displayWidth + 1, config.displayWidth * 2 + 1, 0], // L
  [1, config.displayWidth, config.displayWidth + 1, config.displayWidth * 2] // Z
];

// Check if a rotation is valid
export function isRotationValid(newTetromino, position, squares) {
  const relativeCols = newTetromino.map(offset => offset % config.width);
  const expectedWidth = Math.max(...relativeCols) - Math.min(...relativeCols);
  const newPositions = newTetromino.map(offset => position + offset);
  const newCols = newPositions.map(pos => pos % config.width);
  
  if (Math.max(...newCols) - Math.min(...newCols) !== expectedWidth) return false;
  
  for (let pos of newPositions) {
    if (pos < 0 || pos >= squares.length) return false;
    if (squares[pos].classList.contains('taken')) return false;
  }
  
  return true;
}
