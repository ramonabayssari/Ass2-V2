// JavaScript file for Minesweeper game logic

document.addEventListener("DOMContentLoaded", function () {
    const winGameButton = document.getElementById("revealMinesButton");
    const helpButton = document.getElementById("helpButton");
    const gameboard = document.getElementById("gameboard");
    const startButton = document.getElementById("startButton");
    const playerNameInput = document.getElementById("playername");
    const gameLevelSelect = document.getElementById("gamelevel");
    const timerElement = document.getElementById("timer");
    let timerInterval;
    let timeElapsed = 0;
    let mines = [];
    let rows = 0;
    let cols = 0;
    let revealedCellsCount = 0;
    let totalSafeCells = 0;

    if (startButton) {
        startButton.addEventListener("click", function () {
            const playerName = playerNameInput.value;
            const gameLevel = gameLevelSelect.value;
            if (playerName === "" || gameLevel === "Default") {
                alert("Please enter your name and select a game level to start.");
            } else {
                startGame(gameLevel);
            }
        });
    }

    if (winGameButton) {
        winGameButton.addEventListener("click", function () {
            const password = prompt("Enter password to win the game:");
            if (password === "iam@cheater") {
                clearInterval(timerInterval);
                revealAllCells(true);
                alert("Congratulations, you win!");
                storeScore(true);
            } else {
                alert("Incorrect password! Timer is still running.");
            }
        });
    }

    function startGame(level) {
        resetGameboard();
        generateGameboard(level);
        placeMines(level);
        totalSafeCells = rows * cols - mines.length;
        startTimer();
    }

    function resetGameboard() {
        gameboard.innerHTML = "";
        clearInterval(timerInterval);
        timeElapsed = 0;
        timerElement.textContent = timeElapsed;
        mines = [];
        revealedCellsCount = 0;
    }

    function generateGameboard(level) {
        switch (level) {
            case "Easy":
                rows = 8;
                cols = 8;
                break;
            case "Intermediate":
                rows = 16;
                cols = 16;
                break;
            case "Hard":
                rows = 16;
                cols = 30;
                break;
        }
        gameboard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gameboard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", () => revealCell(cell));
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });
            gameboard.appendChild(cell);
        }
    }

    function placeMines(level) {
        let totalCells = rows * cols;
        let mineCount;
        switch (level) {
            case "Easy":
                mineCount = 10;
                break;
            case "Intermediate":
                mineCount = 40;
                break;
            case "Hard":
                mineCount = 99;
                break;
        }
        while (mines.length < mineCount) {
            const randomIndex = Math.floor(Math.random() * totalCells);
            if (!mines.includes(randomIndex)) {
                mines.push(randomIndex);
            }
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerElement.textContent = timeElapsed;
        }, 1000);
    }

    function revealCell(cell) {
        const index = parseInt(cell.dataset.index);
        if (cell.classList.contains("revealed") || cell.classList.contains("flagged")) {
            return;
        }
        if (mines.includes(index)) {
            revealAllMines();
            alert("Game Over!");
            clearInterval(timerInterval);
            return;
        }
        cell.classList.add("revealed");
        revealedCellsCount++;

        const adjacentMines = countAdjacentMines(index);
        if (adjacentMines > 0) {
            cell.textContent = adjacentMines;
        } else {
            revealAdjacentCells(index);
        }

        if (revealedCellsCount === totalSafeCells) {
            clearInterval(timerInterval);
            revealAllCells(true);
            alert("Congratulations, you win!");
            storeScore(true);
        }
    }

    function revealAdjacentCells(index) {
        const neighbors = getNeighbors(index);
        neighbors.forEach((neighbor) => {
            const neighborCell = gameboard.children[neighbor];
            if (!neighborCell.classList.contains("revealed") && !neighborCell.classList.contains("flagged")) {
                revealCell(neighborCell);
            }
        });
    }

    function countAdjacentMines(index) {
        const neighbors = getNeighbors(index);
        return neighbors.filter((neighbor) => mines.includes(neighbor)).length;
    }

    function getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / cols);
        const col = index % cols;

        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    neighbors.push(newRow * cols + newCol);
                }
            }
        }
        return neighbors;
    }

    function revealAllMines() {
        mines.forEach((mineIndex) => {
            const mineCell = gameboard.children[mineIndex];
            mineCell.classList.add("revealed-mine");
            mineCell.textContent = "💣";
        });
        gameboard.querySelectorAll('.cell.flagged').forEach(cell => {
            const index = parseInt(cell.dataset.index);
            if (!mines.includes(index)) {
                cell.classList.add("incorrect-flag");
                cell.textContent = "❌";
            }
        });
    }

    function revealAllCells(win = false) {
        for (let i = 0; i < rows * cols; i++) {
            const cell = gameboard.children[i];
            if (mines.includes(i)) {
                if (!cell.classList.contains("flagged") && win) {
                    cell.classList.add("flagged");
                    cell.textContent = "🚩";
                } else {
                    cell.classList.add("revealed-mine");
                    cell.textContent = "💣";
                }
            } else {
                cell.classList.add("revealed");
                const adjacentMines = countAdjacentMines(i);
                if (adjacentMines > 0) {
                    cell.textContent = adjacentMines;
                }
            }
        }
        clearInterval(timerInterval);
    }

    function toggleFlag(cell) {
        if (cell.classList.contains("revealed")) return;
        cell.classList.toggle("flagged");
        cell.textContent = cell.classList.contains("flagged") ? "🚩" : "";
    }

    function storeScore(win) {
        if (!win) return;  // Only store score if the player wins
        const playerName = playerNameInput.value;
        const gameLevel = gameLevelSelect.value;
        const score = { name: playerName, level: gameLevel.toLowerCase(), time: timeElapsed, result: "Win" };

        // Retrieve existing scores from localStorage
        let scores = JSON.parse(localStorage.getItem("minesweeperScores")) || [];

        // Filter out scores of the current level, add the new score, then sort and slice to keep top 3
        let levelScores = scores.filter(s => s.level === gameLevel.toLowerCase());
        levelScores.push(score);
        levelScores.sort((a, b) => a.time - b.time);
        levelScores = levelScores.slice(0, 3);

        // Filter out old scores of the current level and add the updated level scores
        scores = scores.filter(s => s.level !== gameLevel.toLowerCase()).concat(levelScores);

        // Store the updated scores back to localStorage
        localStorage.setItem("minesweeperScores", JSON.stringify(scores));

        // Update the display with the new scores
        displayScores();
    }

    function displayScores() {
        const levels = ["easy", "intermediate", "hard"];
        levels.forEach(level => {
            const scoreList = document.getElementById(`${level}-score-list`);
            if (scoreList) {
                scoreList.innerHTML = `
                    <li>1. - -</li>
                    <li>2. - -</li>
                    <li>3. - -</li>
                `;
                let scores = JSON.parse(localStorage.getItem("minesweeperScores")) || [];
                if (!Array.isArray(scores)) {
                    scores = [];
                }
                scores = scores.filter(score => score.level === level);
                scores.sort((a, b) => a.time - b.time);
                scores.slice(0, 3).forEach((score, index) => {
                    scoreList.children[index].textContent = `${index + 1}. ${score.name} - ${score.time}s`;
                });
            }
        });
    }

    displayScores();
});
