let sudokuMatrix = [];
let auto = false;
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

    // Генерация случайного числа для текущей ячейки
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
    // Кнопка создания
    const generateButton = document.getElementById("generate-btn");
    generateButton.addEventListener('click', generateAndFillSudokuGrid);
    // Кнопка проверки
    const checkButton = document.getElementById("check-btn");
    checkButton.addEventListener('click', getAndCheckSudokuGrid);
    // Генерация поля по радио кнопке
    const radioButtons = document.querySelectorAll('input[name="radio"]');
    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', function () {
            generateAndFillSudokuGrid();
        });
    });
    // Создание таблицы
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
    // Авто проверка или нет 
    const autoSwitch = document.getElementById('autocheck');
    autoSwitch.addEventListener('change', function () {
        if (autoSwitch.checked) {
            auto = true;
        } else {
            auto = false;
        }
    });
    // Изменение в ячейке
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('input', function (event) {
            const cellId = event.target.id;
            const coordinates = extractCoordinates(cellId);
            getAndCheckCell(coordinates.row, coordinates.col);
        });
    });
    function extractCoordinates(cellId) {
        const [, row, col] = cellId.split('-');
        return { row: parseInt(row), col: parseInt(col) };
    }
    // Генерация при загрузке страницы
    generateAndFillSudokuGrid();
});

async function generateAndFillSudokuGrid() {
    // Выбор сложности
    const radioButtons = document.querySelectorAll('input[name="radio"]');
    let selectedSize;
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedSize = radioButton.value;
            break;
        }
    }
    // Генерация поля и вывод на экран
    generateSudoku();
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
            if (sudokuPlayable[row][col] !== null) {
                cell.classList.add("not-allowed");
                cell.setAttribute("contenteditable", "false");
                cell.style.pointerEvents = "none";
            } else {
                cell.classList.remove("not-allowed");
                cell.setAttribute("contenteditable", "true");
                cell.style.pointerEvents = "auto";
            }
            //await sleep(20);
        }
    }
    //console.table(sudokuMatrix);
}

async function getAndCheckSudokuGrid() {
    // Проверка поля на правильность
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
                }
            }
            if (sudokuMatrix[row][col] !== playerArray[row][col]) { 
                mistakes++;
            }
            //await sleep(20);
        }
    }
    //console.log(mistakes);
    // Если решено полностью
    if (mistakes === 0) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellId = `cell-${row}-${col}`;
                const cell = document.getElementById(cellId);
                cell.classList.remove("mistake");
                cell.classList.remove("not-allowed");
                cell.classList.add("not-mistake");
                await sleep(20);
            }
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
        }
    }
    else {
        cell.classList.remove("not-mistake");
        cell.classList.remove("mistake");
    }
    console.log(sudokuMatrix[row][col]);
    console.log(cell.value);
    }
}