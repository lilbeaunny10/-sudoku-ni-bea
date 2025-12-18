const grid = document.getElementById('sudoku-grid');
const timerDisplay = document.getElementById('timer');

let currentPuzzle = [];
let currentSolution = [];
let timer = 0;
let timerInterval;
let timerStarted = false;

// ===================
// Initialize
// ===================
window.addEventListener('DOMContentLoaded', () => {
    // Generate first puzzle
    generatePuzzle();

    // Button event listeners
    document.getElementById('new-game-btn').addEventListener('click', generatePuzzle);
    document.getElementById('check-btn').addEventListener('click', checkSolution);
    document.getElementById('reset-btn').addEventListener('click', () => {
        createGrid();
        resetTimer();
        createNumberGuide();
    });
    document.getElementById('next-game-btn').addEventListener('click', generatePuzzle);
});

// ===================
// Generate Puzzle
// ===================
function generatePuzzle() {
    // Hide modal
    document.getElementById('success-modal').style.display = 'none';

    const difficulty = document.getElementById('difficulty').value;
    [currentSolution, currentPuzzle] = createRandomPuzzle(difficulty);

    createGrid();
    createNumberGuide();
    resetTimer();
}

// ===================
// Create Grid
// ===================
function createGrid() {
    grid.innerHTML = '';
    timerStarted = false;

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('input');
        cell.type = 'text';
        cell.maxLength = 1;
        cell.classList.add('cell');

        if (currentPuzzle[i] !== 0) {
            cell.value = currentPuzzle[i];
            cell.disabled = true;
        }

        // Input listener
        cell.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^1-9]/g, '');
            startTimer();
            updateNumberGuide();
            checkSolution(); // auto-check solution
        });

        // Hover highlights
        cell.addEventListener('mouseover', () => highlightCell(i));
        cell.addEventListener('mouseout', removeHighlight);

        // Click highlights
        cell.addEventListener('click', () => highlightNumberRowCol(i));

        grid.appendChild(cell);
    }
}

// ===================
// Timer
// ===================
function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = `Time: ${timer}s`;
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerDisplay.textContent = 'Time: 0s';
    timerStarted = false;
}

// ===================
// Check Solution
// ===================
function checkSolution() {
    const cells = document.querySelectorAll('.cell');
    let correct = true;

    for (let i = 0; i < 81; i++) {
        const val = parseInt(cells[i].value);
        if (val !== currentSolution[i]) {
            if (!cells[i].disabled) cells[i].style.color = 'red';
            correct = false;
        } else {
            cells[i].style.color = 'green';
        }
    }

    if (correct) {
        clearInterval(timerInterval); // stop timer

        // Show success modal
        const modal = document.getElementById('success-modal');
        modal.style.display = 'flex';

        // Trigger confetti
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// ===================
// Hover & Click Highlight
// ===================
function highlightCell(index) {
    const cells = document.querySelectorAll('.cell');
    const row = Math.floor(index / 9);
    const col = index % 9;
    const startRow = row - row % 3;
    const startCol = col - col % 3;

    cells.forEach((cell, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;

        if (r === row || c === col || (r >= startRow && r < startRow + 3 && c >= startCol && c < startCol + 3)) {
            cell.style.backgroundColor = '#f0d9b5';
        } else if (!cell.disabled) {
            cell.style.backgroundColor = '#fff';
        }
    });
}

function removeHighlight() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (!cell.disabled) cell.style.backgroundColor = '#fff';
    });
}

function highlightNumberRowCol(index) {
    const cells = document.querySelectorAll('.cell');
    const clickedCell = cells[index];
    const number = clickedCell.value;
    if (!number) return;

    const row = Math.floor(index / 9);
    const col = index % 9;

    cells.forEach((cell, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;

        cell.style.backgroundColor = '#fff';

        if (r === row || c === col) cell.style.backgroundColor = '#f0d9b5';
        if (cell.value === number) cell.style.backgroundColor = '#ffd966';
    });
}

// ===================
// Number Guide
// ===================
function createNumberGuide() {
    const guide = document.getElementById('number-guide');
    guide.innerHTML = '';

    for (let i = 1; i <= 9; i++) {
        const numCell = document.createElement('div');
        numCell.classList.add('number-cell');
        numCell.id = `guide-${i}`;
        numCell.textContent = i;
        guide.appendChild(numCell);
    }
    updateNumberGuide();
}

function updateNumberGuide() {
    const cells = document.querySelectorAll('.cell');
    for (let num = 1; num <= 9; num++) {
        let count = 0;
        for (let i = 0; i < 81; i++) {
            if (parseInt(cells[i].value) === num) count++;
        }
        const guideCell = document.getElementById(`guide-${num}`);
        if (count === 9) guideCell.classList.add('completed');
        else guideCell.classList.remove('completed');
    }
}

// ===================
// Sudoku Generator
// ===================
function createRandomPuzzle(difficulty) {
    const board = Array(81).fill(0);

    for (let i = 0; i < 9; i += 3) fillBox(board, i, i);
    solveSudoku(board);
    const solution = [...board];

    let clues = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 35 : 25;
    let cellsToRemove = 81 - clues;
    while (cellsToRemove > 0) {
        const idx = Math.floor(Math.random() * 81);
        if (board[idx] !== 0) {
            board[idx] = 0;
            cellsToRemove--;
        }
    }
    return [solution, board];
}

function fillBox(board, rowStart, colStart) {
    const nums = shuffleArray([1,2,3,4,5,6,7,8,9]);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            board[(rowStart + r) * 9 + (colStart + c)] = nums[r*3 + c];
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function solveSudoku(board) {
    const empty = board.indexOf(0);
    if (empty === -1) return true;

    const row = Math.floor(empty / 9);
    const col = empty % 9;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[empty] = num;
            if (solveSudoku(board)) return true;
            board[empty] = 0;
        }
    }
    return false;
}

function isSafe(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row*9 + i] === num || board[i*9 + col] === num) return false;
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[(startRow + r)*9 + startCol + c] === num) return false;
        }
    }
    return true;
}
