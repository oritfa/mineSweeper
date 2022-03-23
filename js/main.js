'use strict'

const MINE = '💣'
const FLAG = '⛳️'
const EMPTY = ' '
const NORMAL = '😃'
const LOSE = '😧'
const WIN = '😎'
const LIFE = '😇'

var gBoard
var gTimeInterval

var gLevel
var gGame

function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        livesCount: 1
    }
   
    getBoardSize()
    gBoard = buildBoard()
    addRandomMines()
    renderResetButton(NORMAL)
    renderBoard(gBoard)
    setMinesNegsCount(gBoard)
    console.log(gBoard)

}


function getBoardSize() {
    if (document.getElementById('Beginner').checked) {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
    }
    if (document.getElementById('Medium').checked) {
        gLevel = {
            SIZE: 8,
            MINES: 12
        }
    }
    if (document.getElementById('Expert').checked) {
        gLevel = {
            SIZE: 12,
            MINES: 30
        }
    }
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board;
}

function renderBoard(board) {

    var value = EMPTY
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];

            var className = 'cell cell-' + i + '-' + j;
            strHTML += `<td onclick="cellClicked(this, ${i}, ${j})" 
                            oncontextmenu="cellMarked(this, ${i}, ${j})"
                            class="${className}">${value}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            var minesAroundCount = countNeighbors(i, j, board)
            cell.minesAroundCount = minesAroundCount
        }
    }

}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            var cell = mat[i][j]
            if (cell.isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (!gGame.shownCount && !gGame.markedCount) startTimer()
    // update Model
    var cell = gBoard[i][j]
    if (cell.isMarked) return
    if (!cell.isShown) {

        var value
        if (cell.isMine) {
            cell.isShown = true
            value = MINE
            gGame.livesCount--
            console.log(' gGame.livesCount', gGame.livesCount)
        } else {                        //to not count mines
            cell.isShown = true
            gGame.shownCount++
            console.log('gGame.shownCount', gGame.shownCount)
        }

        // update DOM

        if (!cell.isMine && cell.minesAroundCount > 0) value = cell.minesAroundCount
        else if (!cell.isMine && cell.minesAroundCount === 0) {
            value = EMPTY
            expandShown(gBoard, elCell, i, j)
        }
        renderCell({ i, j }, value)
        checkGameOver()

    }
}

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    if (gBoard[location.i][location.j].isShown) elCell.classList.add('isShown')

    elCell.innerHTML = value;
}

//Add random mines

function addRandomMines() {
    var emptyCells = findEmptyCells()
    for (var i = 0; i < gLevel.MINES; i++) {
        var randomCell = getRandomCell(emptyCells)
        //update Model
        gBoard[randomCell.i][randomCell.j].isMine = true
    }
}


function cellMarked(elCell, i, j) {
    removeContextMenu()
    if (!gGame.isOn) return
    if (!gGame.shownCount && !gGame.markedCount) startTimer()

    var cell = gBoard[i][j]

    if (cell.isShown) return
    cell.isMarked = !cell.isMarked
    // cell.isShown = false

    // update DOM

    if (cell.isMarked) {
        var value = FLAG
        gGame.markedCount++
        console.log('gGame.markedCount', gGame.markedCount)

    }
    if (!cell.isMarked) {
        var value = EMPTY
        gGame.markedCount--
        console.log('gGame.markedCount', gGame.markedCount)

    }

    elCell.classList.toggle('isMarked')
    renderCell({ i, j }, value)
    checkGameOver()

}

function removeContextMenu() {
    const noContext = document.getElementById('noContextMenu')
    noContext.addEventListener('contextmenu', e => {
        e.preventDefault()
    })
}

function checkGameOver() {

    if (!gGame.livesCount) {
        revealAllMines(gBoard)
        renderResetButton(LOSE)
        gameOver()
    }

    var victory = (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES
    if (victory === gGame.shownCount && gGame.markedCount === gLevel.MINES) {
        // revealAllOtherCells(gBoard) 
        renderResetButton(WIN)
        gameOver()
    }

}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var value
            var cell = board[i][j]
            if (cell.isMine) cell.isShown = true
            if (cell.isShown) {
                if (cell.isMine) value = MINE
                else if (!cell.isMine && cell.minesAroundCount > 0) value = cell.minesAroundCount
                else if (!cell.isMine && cell.minesAroundCount === 0) value = EMPTY
                renderCell({ i, j }, value)

            }
        }
    }

}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var value
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var neighbor = board[i][j]
            if (!neighbor.isShown && !neighbor.isMarked) {      //to make sure not revealing a flag
                neighbor.isShown = true
                gGame.shownCount++
                console.log(i, ',', j)
                console.log('gGame.shownCount', gGame.shownCount)
                console.log('end')
                if (!neighbor.isMine && neighbor.minesAroundCount > 0) value = neighbor.minesAroundCount
                if (!neighbor.isMine && neighbor.minesAroundCount === 0) value = EMPTY
                renderCell({ i, j }, value)
            }
        }
    }
}

function gameOver() {
    gGame.isOn = false
    clearInterval(gTimeInterval)
    console.log('Game Over')
}

function startTimer() {
    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    var startTime = Date.now()
    gTimeInterval = setInterval(function () {
        gGame.secsPassed = Date.now() - startTime
        var time = new Date(gGame.secsPassed)
        var seconds = time.getSeconds()
        var minutes = time.getMinutes()
        if (seconds < 10) elSeconds.innerText = '0' + seconds
        else elSeconds.innerText = seconds
        if (minutes < 60) elMinutes.innerText = '0' + minutes
        else elMinutes.innerText = minutes
    }, 10);
}

function renderResetButton(value){
    var elReset = document.querySelector('.reset');
    elReset.innerText = value

}


