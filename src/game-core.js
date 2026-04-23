const DEFAULT_ROWS = 9;
const DEFAULT_COLUMNS = 9;
const DEFAULT_MINES = 10;

export const DIFFICULTY_PRESETS = {
  easy: { label: "Easy", rows: 9, columns: 9, mines: 10 },
  medium: { label: "Medium", rows: 16, columns: 16, mines: 40 },
  hard: { label: "Hard", rows: 16, columns: 30, mines: 99 },
};

export class MinesweeperGame {
  constructor({
    rows = DEFAULT_ROWS,
    columns = DEFAULT_COLUMNS,
    mines = DEFAULT_MINES,
    difficulty = "easy",
    random = Math.random,
  } = {}) {
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.difficulty = difficulty;
    this.random = random;
    this.restart();
  }

  restart() {
    this.status = "playing";
    this.firstMove = true;
    this.revealedSafeCells = 0;
    this.explodedCell = null;
    this.board = this.createBoard();
  }

  createBoard() {
    return Array.from({ length: this.rows }, (_, row) =>
      Array.from({ length: this.columns }, (_, column) => ({
        row,
        column,
        isMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      })),
    );
  }

  getCell(row, column) {
    if (!this.isInBounds(row, column)) {
      return null;
    }

    return this.board[row][column];
  }

  isInBounds(row, column) {
    return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
  }

  getNeighbors(row, column) {
    const neighbors = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) {
          continue;
        }

        const neighborRow = row + rowOffset;
        const neighborColumn = column + columnOffset;

        if (this.isInBounds(neighborRow, neighborColumn)) {
          neighbors.push(this.board[neighborRow][neighborColumn]);
        }
      }
    }

    return neighbors;
  }

  placeMines(safeRow, safeColumn) {
    const positions = [];

    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        if (row === safeRow && column === safeColumn) {
          continue;
        }

        positions.push({ row, column });
      }
    }

    for (let index = positions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
    }

    for (let index = 0; index < this.mines; index += 1) {
      const { row, column } = positions[index];
      this.board[row][column].isMine = true;
    }

    this.computeAdjacentMines();
  }

  computeAdjacentMines() {
    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        const cell = this.board[row][column];

        if (cell.isMine) {
          cell.adjacentMines = 0;
          continue;
        }

        cell.adjacentMines = this.getNeighbors(row, column).filter(
          (neighbor) => neighbor.isMine,
        ).length;
      }
    }
  }

  reveal(row, column) {
    if (this.status !== "playing") {
      return { changed: false, status: this.status };
    }

    const cell = this.getCell(row, column);

    if (!cell || cell.isRevealed || cell.isFlagged) {
      return { changed: false, status: this.status };
    }

    if (this.firstMove) {
      this.placeMines(row, column);
      this.firstMove = false;
    }

    if (cell.isMine) {
      cell.isRevealed = true;
      this.explodedCell = { row, column };
      this.revealAllMines();
      this.status = "lost";
      return { changed: true, status: this.status };
    }

    this.revealCascade(row, column);
    this.updateWinState();
    return { changed: true, status: this.status };
  }

  revealCascade(startRow, startColumn) {
    const queue = [[startRow, startColumn]];
    const queued = new Set([`${startRow},${startColumn}`]);

    while (queue.length > 0) {
      const [row, column] = queue.shift();
      const cell = this.board[row][column];

      if (cell.isRevealed || cell.isFlagged) {
        continue;
      }

      cell.isRevealed = true;
      this.revealedSafeCells += 1;

      if (cell.adjacentMines !== 0) {
        continue;
      }

      for (const neighbor of this.getNeighbors(row, column)) {
        if (neighbor.isMine || neighbor.isFlagged || neighbor.isRevealed) {
          continue;
        }

        const key = `${neighbor.row},${neighbor.column}`;

        if (!queued.has(key)) {
          queued.add(key);
          queue.push([neighbor.row, neighbor.column]);
        }
      }
    }
  }

  revealAllMines() {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.isMine) {
          cell.isRevealed = true;
        }
      }
    }
  }

  toggleFlag(row, column) {
    if (this.status !== "playing") {
      return { changed: false, flagged: false, status: this.status };
    }

    const cell = this.getCell(row, column);

    if (!cell || cell.isRevealed) {
      return { changed: false, flagged: false, status: this.status };
    }

    cell.isFlagged = !cell.isFlagged;

    return {
      changed: true,
      flagged: cell.isFlagged,
      status: this.status,
    };
  }

  updateWinState() {
    const totalSafeCells = this.rows * this.columns - this.mines;

    if (this.revealedSafeCells === totalSafeCells) {
      this.status = "won";
    }
  }
}

export function createGame(options) {
  return new MinesweeperGame(options);
}

export function createGameForDifficulty(difficulty, options = {}) {
  const preset = DIFFICULTY_PRESETS[difficulty] ?? DIFFICULTY_PRESETS.easy;

  return new MinesweeperGame({
    ...options,
    difficulty,
    rows: preset.rows,
    columns: preset.columns,
    mines: preset.mines,
  });
}
