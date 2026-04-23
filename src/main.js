const boardElement = document.querySelector("#board");
const restartButton = document.querySelector("#restart-button");
const statusText = document.querySelector("#status-text");

const game = window.createGame();

const statusLabels = {
  playing: "In progress",
  won: "You cleared the field",
  lost: "Mine triggered",
};

function render() {
  statusText.textContent = statusLabels[game.status];
  statusText.className = "";

  if (game.status === "won") {
    statusText.classList.add("status-win");
  }

  if (game.status === "lost") {
    statusText.classList.add("status-lose");
  }

  boardElement.replaceChildren();

  for (const row of game.board) {
    for (const cell of row) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.setAttribute("role", "gridcell");
      button.dataset.row = String(cell.row);
      button.dataset.column = String(cell.column);
      button.setAttribute("aria-label", getCellLabel(cell));
      button.disabled = game.status !== "playing" && !cell.isRevealed;

      if (cell.isRevealed) {
        button.classList.add("is-revealed");

        if (cell.isMine) {
          button.classList.add("is-mine");
          button.textContent = "●";
        } else if (cell.adjacentMines > 0) {
          button.dataset.count = String(cell.adjacentMines);
          button.textContent = String(cell.adjacentMines);
        }
      } else if (cell.isFlagged) {
        button.classList.add("is-flagged");
        button.textContent = "⚑";
      }

      if (
        game.explodedCell &&
        game.explodedCell.row === cell.row &&
        game.explodedCell.column === cell.column
      ) {
        button.classList.add("is-exploded");
      }

      boardElement.append(button);
    }
  }
}

function getCellLabel(cell) {
  if (cell.isFlagged) {
    return `Flagged cell at row ${cell.row + 1}, column ${cell.column + 1}`;
  }

  if (!cell.isRevealed) {
    return `Hidden cell at row ${cell.row + 1}, column ${cell.column + 1}`;
  }

  if (cell.isMine) {
    return `Mine at row ${cell.row + 1}, column ${cell.column + 1}`;
  }

  if (cell.adjacentMines === 0) {
    return `Empty revealed cell at row ${cell.row + 1}, column ${cell.column + 1}`;
  }

  return `${cell.adjacentMines} adjacent mines at row ${cell.row + 1}, column ${cell.column + 1}`;
}

boardElement.addEventListener("click", (event) => {
  const cellButton = event.target.closest(".cell");

  if (!cellButton) {
    return;
  }

  game.reveal(Number(cellButton.dataset.row), Number(cellButton.dataset.column));
  render();
});

boardElement.addEventListener("contextmenu", (event) => {
  const cellButton = event.target.closest(".cell");

  if (!cellButton) {
    return;
  }

  event.preventDefault();
  game.toggleFlag(Number(cellButton.dataset.row), Number(cellButton.dataset.column));
  render();
});

restartButton.addEventListener("click", () => {
  game.restart();
  render();
});

render();
