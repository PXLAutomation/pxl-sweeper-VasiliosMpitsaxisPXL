import test from "node:test";
import assert from "node:assert/strict";

import { createGame } from "../src/game-core.js";

function createFixedRandom(values) {
  let index = 0;

  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

function setBoard(game, minePositions) {
  for (const row of game.board) {
    for (const cell of row) {
      cell.isMine = false;
      cell.adjacentMines = 0;
      cell.isRevealed = false;
      cell.isFlagged = false;
    }
  }

  for (const [row, column] of minePositions) {
    game.board[row][column].isMine = true;
  }

  game.computeAdjacentMines();
  game.firstMove = false;
  game.status = "playing";
  game.revealedSafeCells = 0;
  game.explodedCell = null;
}

test("mine placement preserves total mines and keeps the first click safe", () => {
  const game = createGame({
    rows: 3,
    columns: 3,
    mines: 2,
    random: createFixedRandom([0, 0, 0, 0]),
  });

  game.reveal(0, 0);

  const mines = game.board.flat().filter((cell) => cell.isMine);

  assert.equal(mines.length, 2);
  assert.equal(game.board[0][0].isMine, false);
  assert.equal(game.board[0][0].isRevealed, true);
});

test("revealing a numbered cell only reveals that cell", () => {
  const game = createGame({ rows: 3, columns: 3, mines: 1 });
  setBoard(game, [[0, 0]]);

  game.reveal(0, 1);

  assert.equal(game.board[0][1].isRevealed, true);
  assert.equal(game.board[1][1].isRevealed, false);
  assert.equal(game.board[0][1].adjacentMines, 1);
});

test("revealing a zero cell flood reveals connected empties and border numbers", () => {
  const game = createGame({ rows: 5, columns: 5, mines: 2 });
  setBoard(game, [
    [0, 0],
    [4, 4],
  ]);

  game.reveal(2, 2);

  assert.equal(game.board[2][2].isRevealed, true);
  assert.equal(game.board[1][1].isRevealed, true);
  assert.equal(game.board[3][3].isRevealed, true);
  assert.equal(game.board[0][1].isRevealed, true);
  assert.equal(game.board[4][4].isRevealed, false);
});

test("flag toggling works and flagged cells cannot be revealed normally", () => {
  const game = createGame({ rows: 3, columns: 3, mines: 1 });
  setBoard(game, [[2, 2]]);

  const flagged = game.toggleFlag(1, 1);
  const revealAttempt = game.reveal(1, 1);
  const unflagged = game.toggleFlag(1, 1);

  assert.equal(flagged.flagged, true);
  assert.equal(revealAttempt.changed, false);
  assert.equal(game.board[1][1].isRevealed, false);
  assert.equal(unflagged.flagged, false);
});

test("revealing a mine loses the game and reveals mines", () => {
  const game = createGame({ rows: 3, columns: 3, mines: 1 });
  setBoard(game, [[1, 1]]);

  game.reveal(1, 1);

  assert.equal(game.status, "lost");
  assert.deepEqual(game.explodedCell, { row: 1, column: 1 });
  assert.equal(game.board[1][1].isRevealed, true);
});

test("revealing all safe cells wins the game", () => {
  const game = createGame({ rows: 2, columns: 2, mines: 1 });
  setBoard(game, [[0, 0]]);

  game.reveal(0, 1);
  game.reveal(1, 0);
  game.reveal(1, 1);

  assert.equal(game.status, "won");
});

test("restart resets the board state", () => {
  const game = createGame({ rows: 3, columns: 3, mines: 1 });
  setBoard(game, [[2, 2]]);

  game.toggleFlag(0, 0);
  game.reveal(0, 1);
  game.restart();

  assert.equal(game.status, "playing");
  assert.equal(game.firstMove, true);
  assert.equal(game.revealedSafeCells, 0);
  assert.equal(game.board.flat().every((cell) => !cell.isMine && !cell.isRevealed && !cell.isFlagged), true);
});
