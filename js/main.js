'use strict'

const MINE = '💣'
const FLAG = '⛳️'
const EMPTY = ' '
const NORMAL = '😃'
const LOSE = '😧'
const WIN = '😎'
const LIFE = '😇'
const HINT = '💡'
// const SELECTED_HINT = '❣️'


var gBoard
var gTimeInterval
var gHintInterval

var gLevel
var gGame

function initGame() {
    clearInterval(gHintInterval)
    resetTime()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        livesCount: 3,
        shownMines: 0,
        hintsCount: 3,
        isHintOn: false
    }

    getBoardSize()
    renderLives()
    renderHints()
    gBoard = buildBoard()
    console.log(gBoard)

    // addRandomMines()
    renderResetButton(NORMAL)
    renderBoard(gBoard)
    // setMinesNegsCount(gBoard)
    // console.log(gBoard)

}


function getBoardSize() {
    if (document.getElementById('Beginner').checked) {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
        gGame.livesCount = 2
    }
    if (document.getElementById('Medium').checked) {
        gLevel = {
            SIZE: 8,
            MINES: 12
        }
        gGame.livesCount = 3
    }
    if (document.getElementById('Expert').checked) {
        gLevel = {
            SIZE: 12,
            MINES: 30
        }
        gGame.livesCount = 3
    }
    renderLives()
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
    if (gGame.isHintOn) {
        giveHint(i, j)
        return
    }
    var cell = gBoard[i][j]
    if (cell.isMarked) return

    //Add mines on first click
    if (!gGame.shownCount) {
        addRandomMines()
        setMinesNegsCount(gBoard)
        console.log(gBoard)
    }

    if (!cell.isShown) {

        var value
        if (cell.isMine) {
            cell.isShown = true
            value = MINE
            gGame.livesCount--
            renderLives()
            console.log(' gGame.livesCount', gGame.livesCount)
            if (gGame.livesCount >= 1) {
                gGame.shownMines++
            }

        } else {                        //to not count mines
            cell.isShown = true
            gGame.shownCount++
            console.log('gGame.shownCount', gGame.shownCount)

        }

        //without recursion
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
    else if (gGame.isHintOn) elCell.classList.add('isHint')
    else if (!gGame.isHintOn && !gGame.isMarked) elCell.classList.remove('isHint')

    elCell.innerHTML = value;
}

//Add random mines

function addRandomMines() {
    var emptyCells = findEmptyCells()
    for (var i = 0; i < gLevel.MINES; i++) {
        var randomCell = getRandomCell(emptyCells)
        //update Model
        console.log('addRandomMines', randomCell.i, '-', randomCell.j)
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

    var shownCellsForVictory = (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES
    if (shownCellsForVictory === gGame.shownCount && gLevel.MINES === gGame.markedCount + gGame.shownMines) {
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
    clearInterval(gTimeInterval)
    gTimeInterval = setInterval(function () {
        gGame.secsPassed = Date.now() - startTime
        var time = new Date(gGame.secsPassed)
        var seconds = time.getSeconds()
        var minutes = time.getMinutes()
        if (seconds < 10) elSeconds.innerText = '0' + seconds
        else elSeconds.innerText = seconds
        if (minutes < 60) elMinutes.innerText = '0' + minutes
        else elMinutes.innerText = minutes
    }, 100);
}

function resetTime() {
    console.log('resetTime')
    clearInterval(gTimeInterval)
    var elMinutes = document.querySelector('.minutes');
    elMinutes.innerText = '00'
    var elSeconds = document.querySelector('.seconds');
    elSeconds.innerText = '00'
}

function renderResetButton(value) {
    var elReset = document.querySelector('.reset');
    elReset.innerText = value

}

function renderLives() {
    console.log('renderLives')
    if (gGame.livesCount === 3) {
        console.log('renderLives3')
        renderLife('.life1')
        renderLife('.life2')
        renderLife('.life3')
    }

    if (gGame.livesCount === 2) {
        renderLife('.life1')
        renderLife('.life2')
        renderLife('.life3', LIFE, 0)
    }
    if (gGame.livesCount === 1) {
        console.log('renderLives1')
        renderLife('.life2', LIFE, 0)
    }
    if (gGame.livesCount === 0) {
        console.log('renderLives0')
        renderLife('.life1', LIFE, 0)
    }

}

function renderLife(LifeClass, value = LIFE, isShown = 1) {
    var elLife = document.querySelector(LifeClass);
    elLife.innerText = value
    elLife.style.opacity = isShown
}

function renderHints() {
    renderHint('.hint1', HINT)
    renderHint('.hint2', HINT)
    renderHint('.hint3', HINT)
}

function renderHint(hintClass, value = HINT, isShown = 1) {
    var elHint = document.querySelector(hintClass);
    elHint.innerText = value
    elHint.style.opacity = isShown
}

function startHint(elHint) {
    gGame.isHintOn = true
    elHint.style.opacity = 0

}

function giveHint(i, j) {
    revealCellAndNeighbors(i, j, gBoard)
    setTimeout(hideCellAndNeighbors, 1000, i, j, gBoard)
    gGame.isHintOn = false
}

function revealCellAndNeighbors(cellI, cellJ, board) {
    console.log('revealCellAndNeighbors')
    var value
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j]
            if (!cell.isMine && cell.minesAroundCount > 0) value = cell.minesAroundCount
            else if (!cell.isMine && cell.minesAroundCount === 0) value = EMPTY
            else if (cell.isMine) value = MINE
            console.log('revealNeighbors, value', value)
            renderCell({ i, j }, value)
        }
    }
}

function hideCellAndNeighbors(cellI, cellJ, board) {
    console.log('hideCellAndNeighbors')
    var value
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j]
            if (cell.isShown){
                if (!cell.isMine && cell.minesAroundCount > 0) value = cell.minesAroundCount
                else if (!cell.isMine && cell.minesAroundCount === 0) value = EMPTY
                else if (cell.isMine) value = MINE
            }else if (!cell.isMarked){
                value = EMPTY
            }else if (cell.isMarked){
                value = FLAG
            }
            renderCell({ i, j }, value)
        }
    }
}


function findSafeCells(){
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown) {
                safeCells.push({ i, j })
            }
        }
    }
    console.log(safeCells)
    return safeCells
}

function getSafeCell(){
    var safeCells = findSafeCells()
    var safeCell = getRandomCell(safeCells)

    var elCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    elCell.classList.add('isSafe')
    elCell.innerHTML = EMPTY
    setTimeout(removeIsSafe, 2000, elCell)

}

function removeIsSafe(elCell){
    elCell.classList.remove('isSafe')
}



