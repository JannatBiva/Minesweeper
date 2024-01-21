// UI

import {
  cellStatuses,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  showMessage,
} from "./minesweeper.js";

function refreshGame() {
  location.reload();
}

document.addEventListener("DOMContentLoaded", function() {
  let gameInProgress = true;
  let selectedCell = null;


  const refreshButton = document.getElementById("refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener("click", refreshGame);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const initialSize = parseInt(urlParams.get("size")) || 10;
  const initialMines = parseInt(urlParams.get("mines")) || 10;


  const BoardSize = initialSize;
  const NumberOfMines = initialMines;


  const board = createBoard(BoardSize, NumberOfMines);
  const boardElement = document.querySelector(".board");
  const minesLeftText = document.querySelector("[data-mine-count]");


  const instructionButton = document.querySelector(".instruction-button");
  const closeIcon = document.getElementById("closeIcon");
  const modal = document.getElementById("instruction-modal");

  instructionButton.addEventListener("click", openInstructions);
  closeIcon.addEventListener("click", closeInstructions);

  board.forEach((row) => {
    row.forEach((cell) => {
      boardElement.append(cell.element);

      // For desktop right-click
      cell.element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        markTile(cell);
        listMinesLeft();
      });

      // For both desktop and mobile click
      cell.element.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
          // Left click
          revealTile(board, cell);
          checkGameEnd();
        }
      });

      // For keyboard navigation
      cell.element.setAttribute("tabindex", "0");
      cell.element.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          revealOrMark(cell);
        } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault();
          moveSelection(e.key, cell);
        }
      });
      cell.element.addEventListener("focus", () => {
        if (selectedCell) {
          selectedCell.element.classList.remove("selected");
        }
        selectedCell = cell;
        cell.element.classList.add("selected");
      });

      cell.element.addEventListener("blur", () => {
        cell.element.classList.remove("selected");
      });
    });
  });

  boardElement.style.setProperty("--size", BoardSize);
  minesLeftText.textContent = NumberOfMines;

  function openInstructions() {
    const modal = document.getElementById("instruction-modal");
    if (modal) {
      modal.style.display = "block";
    }
  }

  function closeInstructions() {
    modal.style.display = "none";
  }


  function listMinesLeft() {
    const markedCellsCount = board.reduce((count, row) => {
      return count + row.filter((cell) => cell.status === cellStatuses.Marked)
        .length;
    }, 0);

    minesLeftText.textContent = NumberOfMines - markedCellsCount;
  }

  function checkGameEnd() {
    const win = checkWin(board);
    const lose = checkLose(board);

    if (win || lose) {
      gameInProgress = false;
      boardElement.addEventListener("click", stopProp, { capture: true });
      boardElement.addEventListener("contextmenu", stopProp, { capture: true });
    }

    if (win) {
      showMessage("You Win");
    }
    if (lose) {
      showMessage("You Lose");
      board.forEach((row) => {
        row.forEach((cell) => {
          if (cell.status === cellStatuses.Marked) markTile(cell);
          if (cell.mine) revealTile(board, cell);
        });
      });
    }
  }

  boardElement.setAttribute("tabindex", "0");
  boardElement.addEventListener("keydown", handleKeyPress);

  function handleKeyPress(event) {
    if (gameInProgress && selectedCell) {
      switch (event.key) {
        case "Enter":
          // Handle reveal or mark logic
          revealOrMark(selectedCell);
          break;
        default:
          break;
      }
    }
  }

  function moveSelection(key, currentCell) {
    let newRow = currentCell.x;
    let newCol = currentCell.y;

    switch (key) {
      case "ArrowUp":
        newRow = Math.max(0, newRow - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(BoardSize - 1, newRow + 1);
        break;
      case "ArrowLeft":
        newCol = Math.max(0, newCol - 1);
        break;
      case "ArrowRight":
        newCol = Math.min(BoardSize - 1, newCol + 1);
        break;
      default:
        break;
    }

    board[newRow][newCol].element.focus();
  }

  function revealOrMark(cell) {
    if (cell) {
      if (cell.status === cellStatuses.Hidden) {
        revealTile(board, cell);
        checkGameEnd();
      } else if (cell.status === cellStatuses.Marked) {
        markTile(cell);
        listMinesLeft();
      }
    }
  }

  function stopProp(e) {
    e.stopImmediatePropagation();
  }

  document.addEventListener("click", function(event) {
    const modal = document.getElementById("instruction-modal");

    if (event.target.classList.contains("instruction-button")) {
      openInstructions();
    } else if (modal && event.target === modal) {
      closeInstructions();
    }
  });

  const gridSizeSelect = document.getElementById("gridSize");
  gridSizeSelect.value = initialSize.toString();
  gridSizeSelect.addEventListener("change", handleGridSizeChange);

  function handleGridSizeChange() {
    const newSize = parseInt(gridSizeSelect.value, 10);
    if (newSize !== BoardSize) {
      location.href = `?size=${newSize}&mines=${NumberOfMines}`;
    }
    document.querySelector('label[for="gridSize"]').textContent = `${newSize}x${newSize}`;
  }
});

window.refreshGame = refreshGame;
