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
    return grid;
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
    while (iteration < emptyCells) {
    let x = Math.floor(Math.random() * 9);
    let y = Math.floor(Math.random() * 9);
        if (grid[x][y] !== null) {
            grid[x][y] = null;
            iteration++;
        }
    }
    return grid;
}

function checkSudokuGrid(playerArray) {
    let mistakes = 0;
    for (let i = 0; i<9; i++) {
        for (let j = 0; j<9; j++) {
            let check = playerArray[i][j];
            playerArray[i][j] = 0;
            if (!isValid(playerArray, i, j, check)) {
                mistakes++;
            }
            playerArray[i][j] = check;
        }
    }
    return mistakes;
}

document.addEventListener('DOMContentLoaded', function () {
    //Кнопки и создание таблицы
    const gridSize = 9;
    const solveButton = document.getElementById("generate-btn");
    solveButton.addEventListener('click', generateAndFillSudokuGrid);
    const checkButton = document.getElementById("check-btn");
    checkButton.addEventListener('click', getAndCheckSudokuGrid);
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
});

async function generateAndFillSudokuGrid() {
    // Генерация поля и вывод на экран
    const gridSize = 9;
    const sudokuArray = generateSudoku();
    //console.table(sudokuArray);
    const sudokuPlayable = makeSudokuPlayable(sudokuArray, 40);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
            cell.value = sudokuPlayable[row][col];
        }
    }
    // Определение ячеек, которые нельзя изменять
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            const cell = document.getElementById(cellId);
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
    let mistakes = checkSudokuGrid(playerArray);
    if (mistakes === 0) {
        alert("Верно");
    }
    else {
        alert("Ошибка");
    }
}
