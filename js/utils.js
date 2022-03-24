'use strict'

function findEmptyCells() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.MINE && cell.minesAroundCount === 0) {
                emptyCells.push({ i, j })
            }
        }
    }
    // console.log(emptyCells)
    return emptyCells
}

function getRandomCell(cells) {
    var idx = getRandomInt(0, cells.length)
    var cell = cells[idx]
    cells.splice(idx, 1)
    return cell
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// function revealAllOtherCells(board) {
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board.length; j++) {
//             var value
//             var cell = board[i][j]
//             if (!cell.isMarked && !cell.isShown) cell.isShown = true
//             if (cell.isShown) {
//                 if (cell.isMine) value = MINE
//                 if (!cell.isMine && cell.minesAroundCount > 0) value = cell.minesAroundCount
//                 if (!cell.isMine && cell.minesAroundCount === 0) value = EMPTY
//                 renderCell({ i, j }, value)
//             }
//         }
//     }
// }