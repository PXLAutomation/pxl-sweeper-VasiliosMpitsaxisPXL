const boardElement = document.querySelector("#board");
const restartButton = document.querySelector("#restart-button");
const difficultySelect = document.querySelector("#difficulty-select");
const statusText = document.querySelector("#status-text");
const difficultyText = document.querySelector("#difficulty-text");
const mineCountText = document.querySelector("#mine-count-text");
const timerText = document.querySelector("#timer-text");

let game = window.createGameForDifficulty(difficultySelect.value);
let timerId = null;
let startedAt = null;
let frozenElapsedSeconds = 0;

const statusLabels = {
  playing: "In progress",
  won: "You cleared the field",
  lost: "Mine triggered",
};

function getPreset() {
  return window.DIFFICULTY_PRESETS[game.difficulty] || window.DIFFICULTY_PRESETS.easy;
}

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

function getElapsedSeconds() {
  if (!startedAt) {
    return frozenElapsedSeconds;
  }

  return Math.floor((Date.now() - startedAt) / 1000);
}

function updateTimer() {
  timerText.textContent = formatElapsed(getElapsedSeconds());
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function ensureTimerRunning() {
  if (timerId) {
    return;
  }

  timerId = window.setInterval(updateTimer, 1000);
}

function handleTimerForState() {
  if (game.status !== "playing" && startedAt) {
    frozenElapsedSeconds = getElapsedSeconds();
    startedAt = null;
    stopTimer();
  } else {
    if (game.status !== "playing") {
      stopTimer();
    }
  }

  updateTimer();
}

function updateBoardMetrics() {
  const viewportWidth = window.innerWidth;
  const outerPadding = viewportWidth <= 640 ? 40 : 72;
  const cardInnerPadding = viewportWidth <= 640 ? 40 : 56;
  const boardPadding = 28;
  const gap = 6;
  const availableWidth = Math.max(280, viewportWidth - outerPadding - cardInnerPadding - boardPadding);
  const maxCellSize = game.columns >= 30 ? 46 : game.columns >= 16 ? 42 : 52;
  const minCellSize = game.columns >= 30 ? 18 : game.columns >= 16 ? 22 : 30;
  const fittedCellSize = Math.floor((availableWidth - gap * (game.columns - 1)) / game.columns);
  const cellSize = Math.max(minCellSize, Math.min(maxCellSize, fittedCellSize));
  const boardWidth = cellSize * game.columns + gap * (game.columns - 1) + boardPadding;
  const cardWidth = boardWidth + cardInnerPadding;

  boardElement.style.setProperty("--columns", String(game.columns));
  boardElement.style.setProperty("--cell-size", `${cellSize}px`);
  document.documentElement.style.setProperty("--card-width", `${cardWidth}px`);
}

function startTimerIfNeeded() {
  if (startedAt || game.status !== "playing") {
    return;
  }

  startedAt = Date.now();
  ensureTimerRunning();
  updateTimer();
}

function startNewGame() {
  game = window.createGameForDifficulty(difficultySelect.value);
  startedAt = null;
  frozenElapsedSeconds = 0;
  stopTimer();
  updateBoardMetrics();
  render();
}

function render() {
  const preset = getPreset();

  statusText.textContent = statusLabels[game.status];
  statusText.className = "";
  difficultyText.textContent = preset.label;
  mineCountText.textContent = String(game.mines);
  difficultySelect.value = game.difficulty;

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

  handleTimerForState();
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

  const result = game.reveal(Number(cellButton.dataset.row), Number(cellButton.dataset.column));

  if (result.changed) {
    startTimerIfNeeded();
  }

  render();
});

boardElement.addEventListener("contextmenu", (event) => {
  const cellButton = event.target.closest(".cell");

  if (!cellButton) {
    return;
  }

  event.preventDefault();
  const result = game.toggleFlag(Number(cellButton.dataset.row), Number(cellButton.dataset.column));

  if (result.changed) {
    startTimerIfNeeded();
  }

  render();
});

difficultySelect.addEventListener("change", startNewGame);

restartButton.addEventListener("click", startNewGame);
window.addEventListener("resize", updateBoardMetrics);

startNewGame();
