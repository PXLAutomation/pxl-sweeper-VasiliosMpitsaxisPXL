(() => {
class MinesweeperGame {
  constructor({
    rows = 9,
    columns = 9,
    mines = 10,
    random = Math.random,
  } = {}) {
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.random = random;
    this.restart();
  }

  restart() {
    this.status = "playing";
    this.firstMove = true;
    this.revealedSafeCells = 0;
    this.explodedCell = null;
    this.board = Array.from({ length: this.rows }, (_, row) =>
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
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      return null;
    }

    return this.board[row][column];
  }

  getNeighbors(row, column) {
    const neighbors = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) {
          continue;
        }

        const neighbor = this.getCell(row + rowOffset, column + columnOffset);

        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  placeMines(safeRow, safeColumn) {
    const positions = [];

    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        if (row !== safeRow || column !== safeColumn) {
          positions.push({ row, column });
        }
      }
    }

    for (let index = positions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
    }

    for (let index = 0; index < this.mines; index += 1) {
      const position = positions[index];
      this.board[position.row][position.column].isMine = true;
    }

    for (const row of this.board) {
      for (const cell of row) {
        if (!cell.isMine) {
          cell.adjacentMines = this.getNeighbors(cell.row, cell.column).filter(
            (neighbor) => neighbor.isMine,
          ).length;
        }
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
      for (const boardRow of this.board) {
        for (const boardCell of boardRow) {
          if (boardCell.isMine) {
            boardCell.isRevealed = true;
          }
        }
      }
      this.status = "lost";
      return { changed: true, status: this.status };
    }

    const queue = [[row, column]];
    const seen = new Set([`${row},${column}`]);

    while (queue.length > 0) {
      const [currentRow, currentColumn] = queue.shift();
      const currentCell = this.board[currentRow][currentColumn];

      if (currentCell.isRevealed || currentCell.isFlagged) {
        continue;
      }

      currentCell.isRevealed = true;
      this.revealedSafeCells += 1;

      if (currentCell.adjacentMines === 0) {
        for (const neighbor of this.getNeighbors(currentRow, currentColumn)) {
          if (neighbor.isMine || neighbor.isFlagged || neighbor.isRevealed) {
            continue;
          }

          const key = `${neighbor.row},${neighbor.column}`;

          if (!seen.has(key)) {
            seen.add(key);
            queue.push([neighbor.row, neighbor.column]);
          }
        }
      }
    }

    if (this.revealedSafeCells === this.rows * this.columns - this.mines) {
      this.status = "won";
    }

    return { changed: true, status: this.status };
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
    return { changed: true, flagged: cell.isFlagged, status: this.status };
  }
}

function createGame(options) {
  return new MinesweeperGame(options);
}

window.MinesweeperGame = MinesweeperGame;
window.createGame = createGame;
})();
