// Game Logic

export const cellStatuses = {
  Hidden: "hidden",
  Mine: "mine",
  Number: "number",
  Marked: "marked",
}

export function createBoard(BoardSize, NumberOfMines) {
  const board = []
  const minePositions = getMinePositions(BoardSize, NumberOfMines)

  for (let x = 0; x < BoardSize; x++) {
    const row = []
    for (let y = 0; y < BoardSize; y++) {
      const element = document.createElement("div")
      element.dataset.status = cellStatuses.Hidden

      const tile = {
        element,
        x,
        y,
        mine: minePositions.some(positionMatch.bind(null, { x, y })),
        get status() {
          return this.element.dataset.status
        },
        set status(value) {
          this.element.dataset.status = value
        },
      }

      row.push(tile)
    }
    board.push(row)
  }

  return board
}

export function markTile(tile) {
  if (
    tile.status !== cellStatuses.Hidden &&
    tile.status !== cellStatuses.Marked
  ) {
    return
  }

  if (tile.status === cellStatuses.Marked) {
    tile.status = cellStatuses.Hidden
  } else {
    tile.status = cellStatuses.Marked
  }
}

export function revealTile(board, tile) {
  if (tile.status !== cellStatuses.Hidden) {
    return
  }

  if (tile.mine) {
    tile.status = cellStatuses.Mine
    tile.element.textContent = '💣'

    return
  }

  tile.status = cellStatuses.Number
  const adjacentTiles = nearbyTiles(board, tile)
  const mines = adjacentTiles.filter(t => t.mine)
  if (mines.length === 0) {
    adjacentTiles.forEach(revealTile.bind(null, board))
  } else {
    tile.element.textContent = mines.length
  }
}

export function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.status === cellStatuses.Number ||
        (tile.mine &&
          (tile.status === cellStatuses.Hidden ||
            tile.status === cellStatuses.Marked))
      )
    })
  })
}

export function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.status === cellStatuses.Mine
    })
  })
}
export function showMessage(message) {
  const messageBox = document.querySelector(".message-box");
  const messageText = document.querySelector(".message-text");
  const messageImage = document.querySelector(".message-image");

  messageText.textContent = message;

  if (message === "You Win") {
    messageImage.src = "Win_image.webp";
  } else if (message === "You Lose") {
    messageImage.src = "lose_image.webp";
  }

  messageBox.style.display = "block";
}

function getMinePositions(BoardSize, NumberOfMines) {
  const positions = []

  while (positions.length < NumberOfMines) {
    const position = {
      x: randomNumber(BoardSize),
      y: randomNumber(BoardSize),
    }

    if (!positions.some(positionMatch.bind(null, position))) {
      positions.push(position)
    }
  }

  return positions
}

function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y
}

function randomNumber(size) {
  return Math.floor(Math.random() * size)
}

function nearbyTiles(board, { x, y }) {
  const tiles = []

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      const tile = board[x + xOffset]?.[y + yOffset]
      if (tile) tiles.push(tile)
    }
  }

  return tiles
}
