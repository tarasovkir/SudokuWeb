let sudokuMatrix = [];
let auto = false;
let seconds = 0;
let minutes = 0;
let hours = 0;
let interval;
let startTime;
let solvingTime = 0;
let selectedSize;

function generateSudoku() {
    const size = 9;
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid.push([]);
        for (let j = 0; j < size; j++) {
            grid[i].push(0);
        }
    }
    fillGrid(grid, 0, 0);
    sudokuMatrix = grid;
}

function fillGrid(grid, row, col) {
    const size = 9;
    if (row === size - 1 && col === size) {
        return true;
    }
    if (col === size) {
        row++;
        col = 0;
    }
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    nums.sort(() => Math.random() - 0.5);
    for (let num of nums) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid, row, col + 1)) {
                return true;
            }
            grid[row][col] = 0;
        }
    }
    return false;
}

function isValid(grid, row, col, num) {
    return (
        !usedInRow(grid, row, num) &&
        !usedInCol(grid, col, num) &&
        !usedInBox(grid, row - (row % 3), col - (col % 3), num)
    );
}

function usedInRow(grid, row, num) {
    return grid[row].includes(num);
}

function usedInCol(grid, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) {
            return true;
        }
    }
    return false;
}

function usedInBox(grid, startRow, startCol, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) {
                return true;
            }
        }
    }
    return false;
}

function makeSudokuPlayable(grid, emptyCells) {
    let iteration = 0;
    newMatrix = grid;
    while (iteration < emptyCells) {
        let x = Math.floor(Math.random() * 9);
        let y = Math.floor(Math.random() * 9);
        if (newMatrix[x][y] !== null) {
            newMatrix[x][y] = null;
            iteration++;
        }
    }
    return newMatrix;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', function () {
    const gridSize = 9;
    const generateButton = document.getElementById("generate-btn");
    generateButton.addEventListener('click', generateAndFillSudokuGrid);
    const checkButton = document.getElementById("check-btn");
    checkButton.addEventListener('click', getAndCheckSudokuGrid);
    const radioButtons = document.querySelectorAll('input[name="radio"]');
    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', function () {
            generateAndFillSudokuGrid();
        });
    });
    const sudokuGrid = document.getElementById("sudoku-grid");
    for (let row = 0; row < gridSize; row++) {
        const newRow = document.createElement("tr");
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.className = "cell";
            input.id = `cell-${row}-${col}`;
            cell.appendChild(input);
            newRow.appendChild(cell);
        }
        sudokuGrid.appendChild(newRow);
    }
    const autoSwitch = document.getElementById('autocheck');
    autoSwitch.addEventListener('change', function () {
        if (autoSwitch.checked) {
            auto = true;
        } else {
            auto = false;
        }
    });
    let previousValue = '';
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('input', function (event) {
            const cellId = event.target.id;
            const coordinates = extractCoordinates(cellId);
            getAndCheckCell(coordinates.row, coordinates.col);
            if  (!hasEmptyCells()) {
                getAndCheckSudokuGrid();
            }
            if (cell.value === '') {
                cell.classList.remove("mistake");
            }
            cell.addEventListener('keydown', function (event) {
                if (isCellValueLongerThanOne(cell)) {
                    if (event.key !== 'Backspace') {
                        event.preventDefault();
                    }
                }
            });
            cell.addEventListener('keydown', function (event) {
                if (event.key.startsWith('Arrow')) {
                    event.preventDefault();
                }
            });
        });
    });
    cells.forEach(cell => {
        cell.addEventListener('keydown', function (event) {
            if (event.key.startsWith('Arrow')) {
                event.preventDefault();
            }
        });
    });
    function extractCoordinates(cellId) {
        const [, row, col] = cellId.split('-');
        return { row: parseInt(row), col: parseInt(col) };
    }
    generateAndFillSudokuGrid();    
    document.getElementById('profile-button').addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('profile-window').style.display = 'block';
    });
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('profile-window').style.display = 'none';
    });

});

async function generateAndFillSudokuGrid() {
    const radioButtons = document.querySelectorAll('input[name="radio"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedSize = radioButton.value;
            break;
        }
    }
    generateSudoku();
    resetTimer();
    startTimer();
    const gridSize = 9;
    const sudokuMatrixCopy = []; 
    for (let i = 0; i < gridSize; i++) {
        sudokuMatrixCopy.push([]);
        for (let j = 0; j < gridSize; j++) {
            sudokuMatrixCopy[i].push(0);
        }
    }
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            sudokuMatrixCopy[row][col] = sudokuMatrix[row][col];
        }
    }
    const sudokuPlayable = makeSudokuPlayable(sudokuMatrixCopy, selectedSize);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
            cell.value = sudokuPlayable[row][col];
            cell.classList.remove("not-mistake");
            cell.classList.remove("mistake");
            if (sudokuPlayable[row][col] !== null) {
                cell.classList.add("not-allowed");
                cell.setAttribute("contenteditable", "false");
                cell.style.pointerEvents = "none";
            } else {
                cell.classList.remove("not-allowed");
                cell.setAttribute("contenteditable", "true");
                cell.style.pointerEvents = "auto";
            }
        }
    }
}

async function getAndCheckSudokuGrid() {
    const gridSize = 9;
    const playerArray = [];
    for (let row = 0; row < gridSize; row++) {
        playerArray[row] = [];
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cellValue = document.getElementById(cellId).value;
            playerArray[row][col] = cellValue !== "" ? parseInt(cellValue) : 0;
        }
    }
    let mistakes = 0;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
            if (cell.value !== "" && !cell.classList.contains("not-allowed")) {
                if (sudokuMatrix[row][col] !== playerArray[row][col]) {
                    cell.classList.remove("not-mistake");
                    cell.classList.add("mistake");
                } else {
                    cell.classList.remove("mistake");
                    cell.classList.add("not-mistake");
                    cell.setAttribute("contenteditable", "false");
                    cell.style.pointerEvents = "none";
                    cell.blur();
                }
            }
            if (sudokuMatrix[row][col] !== playerArray[row][col]) {
                mistakes++;
            }
        }
    }
    if (mistakes === 0) {
        pauseTimer();
        const userId = getUserId();
        const solvingTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
        const selectedDifficulty = getSelectedDifficulty();
        const currentRecord = await getCurrentRecord(userId, selectedDifficulty);
        if (currentRecord == 0 || currentRecord > solvingTimeInSeconds) {
            await sendRecordToServer(userId, selectedDifficulty, solvingTimeInSeconds);
        }
    }
}

async function getAndCheckCell(row, col) {
    if (auto) {
        const cellId = `cell-${row}-${col}`;
        const cell = document.getElementById(cellId);
        cell.classList.remove("not-mistake");
        cell.classList.remove("mistake");
        if (cell.value !== "") {
            if (sudokuMatrix[row][col] !== parseInt(cell.value)) {
                cell.classList.remove("not-mistake");
                cell.classList.add("mistake");
            }
            else {
                cell.classList.remove("mistake");
                cell.classList.add("not-mistake");
                cell.setAttribute("contenteditable", "false");
                cell.style.pointerEvents = "none";
                cell.blur();
            }
        }
        else {
            cell.classList.remove("not-mistake");
            cell.classList.remove("mistake");
        }

    }
}

function hasEmptyCells() {
    const cells = document.querySelectorAll('.cell');
    for (let cell of cells) {
        if (cell.value === '') {
            return true;
        }
    }
    return false;
}

function updateTime() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    if (minutes === 60) {
        hours++;
        minutes = 0;
    }
    timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    startTime = Date.now();
    interval = setInterval(updateTime, 1000);
}

function pauseTimer() {
    clearInterval(interval);
    solvingTime = Date.now() - startTime;
}

function resetTimer() {
    clearInterval(interval);
    seconds = 0;
    minutes = 0;
    hours = 0;
    const timer = document.getElementById('timer');
    timer.textContent = '00:00:00';
}

function Digits(event) {
    if ("123456789".indexOf(event.key) === -1)
      event.preventDefault();
}

function isCellValueLongerThanOne(cell) {
    return cell.value.length >= 1;
}

async function updateRecord(userId, difficulty, newRecord) {
    try {
        const response = await fetch(`http://localhost:3000/api/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ [`records.${difficulty}`]: newRecord })
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error updating record:', error.message);
    }
}

function getUserId() {
    return localStorage.getItem('userId');
}
function getSelectedDifficulty() {
    const difficultyRadios = document.querySelectorAll('input[name="radio"]');
    for (const radioButton of difficultyRadios) {
        if (radioButton.checked) {
            const value = radioButton.value;
            return `difficulty${value}`;
        }
    }
}

async function getCurrentRecord(userId, difficulty) {
    const userRecord = await getUserRecords(userId, difficulty);
    return userRecord[difficulty];
}

async function getUserRecords(userId, difficulty) {
    try {
        const response = await fetch(`/api/user/${userId}/records/${difficulty}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user record');
        }
        const userRecord = await response.json();
        return userRecord;
    } catch (error) {
        console.error('Error fetching user record:', error.message);
        return null;
    }
}

async function sendRecordToServer(userId, difficulty, record) {
    try {
        const response = await fetch(`/api/profile/${userId}/records`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ difficulty, newRecord: record })
        });
        const data = await response.json();
        alert(data.message);
        console.log(data.message);
    } catch (error) {
        console.error('Error updating record:', error.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('new-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passreq = document.getElementById('pochtatext');
    const userId = getUserId();
    async function getUserRole(userId) {
        try {
            const response = await fetch(`/api/profile/${userId}/role`);
            if (!response.ok) {
                throw new Error('Failed to fetch user role');
            }
            const { role } = await response.json();
            return role;
        } catch (error) {
            console.error('Error fetching user role:', error.message);
            return null;
        }
    }

    try {
        const userRole = await getUserRole(userId);
        if (userRole === 'admin') {
            emailField.style.display = 'block';
            passwordField.style.display = 'block';
            changePasswordBtn.style.display = 'block';
            passreq.style.display = 'none';
        } else {
            emailField.style.display = 'none';
            passwordField.style.display = 'none';
            changePasswordBtn.style.display = 'none';
            passreq.style.display = 'block';
        }
    } catch (error) {
        console.error('Error handling user role:', error.message);
    }

    changePasswordBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const newPassword = document.getElementById('new-password').value;
        try {
            const response = await fetch(`/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, newPassword })
            });
            if (!response.ok) {
                throw new Error('Failed to update password');
            }
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error updating password:', error.message);
        }
    });
    fetch('/api/top-records')
            .then(response => response.json())
            .then(data => {
                const difficulties = ['difficulty1', 'difficulty2', 'difficulty3', 'difficulty4', 'difficulty5'];

                difficulties.forEach(difficulty => {
                    const table = document.getElementById(`${difficulty}-table`);
                    const records = data[difficulty];

                    records.forEach(record => {
                        const row = table.insertRow();
                        row.insertCell(0).innerText = record.place;
                        row.insertCell(1).innerText = record.username;
                        row.insertCell(2).innerText = record.time;
                    });
                });
            })
            .catch(error => console.error('Error fetching top records:', error));
});
