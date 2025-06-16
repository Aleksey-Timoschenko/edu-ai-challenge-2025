const readline = require('readline');

// Constants
const BOARD_SIZE = 10;
const NUM_SHIPS = 3;
const SHIP_LENGTH = 3;

// Ship class to manage ship state and operations
class Ship {
  constructor() {
    this.locations = [];
    this.hits = [];
  }

  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  addLocation(location) {
    this.locations.push(location);
    this.hits.push('');
  }
}

// Board class to handle board operations
class Board {
  constructor() {
    this.grid = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill('~'));
    this.ships = [];
  }

  placeShip(ship, locations) {
    locations.forEach(location => {
      const [row, col] = location.split('').map(Number);
      this.grid[row][col] = 'S';
      ship.addLocation(location);
    });
    this.ships.push(ship);
  }

  placeShipsRandomly(numShips) {
    let placedShips = 0;

    while (placedShips < numShips) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const startRow = orientation === 'horizontal'
        ? Math.floor(Math.random() * BOARD_SIZE)
        : Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
      const startCol = orientation === 'horizontal'
        ? Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1))
        : Math.floor(Math.random() * BOARD_SIZE);

      const locations = [];
      let collision = false;

      for (let i = 0; i < SHIP_LENGTH; i++) {
        const row = orientation === 'horizontal' ? startRow : startRow + i;
        const col = orientation === 'horizontal' ? startCol + i : startCol;

        if (row >= BOARD_SIZE || col >= BOARD_SIZE || this.grid[row][col] !== '~') {
          collision = true;
          break;
        }

        locations.push(`${row}${col}`);
      }

      if (!collision) {
        const ship = new Ship();
        this.placeShip(ship, locations);
        placedShips++;
      }
    }
  }

  processGuess(guess) {
    const [row, col] = guess.split('').map(Number);
    const guessStr = guess;

    for (const ship of this.ships) {
      const index = ship.locations.indexOf(guessStr);
      if (index >= 0) {
        if (ship.hits[index] === 'hit') {
          return { hit: true, alreadyHit: true };
        }
        ship.hits[index] = 'hit';
        this.grid[row][col] = 'X';
        return {
          hit: true,
          sunk: ship.isSunk(),
          alreadyHit: false
        };
      }
    }

    this.grid[row][col] = 'O';
    return { hit: false, alreadyHit: false };
  }

  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }
}

// Base Player class
class Player {
  constructor(name) {
    this.name = name;
    this.board = new Board();
    this.guesses = new Set();
  }

  isValidGuess(guess) {
    if (!guess || guess.length !== 2) return false;

    const [row, col] = guess.split('').map(Number);
    return !isNaN(row) && !isNaN(col) &&
           row >= 0 && row < BOARD_SIZE &&
           col >= 0 && col < BOARD_SIZE &&
           !this.guesses.has(guess);
  }
}

// Human Player class
class HumanPlayer extends Player {
  constructor() {
    super('Player');
  }

  async makeGuess() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your guess (e.g., 00): ', (answer) => {
        rl.close();
        if (this.isValidGuess(answer)) {
          this.guesses.add(answer);
          resolve(answer);
        } else {
          console.log('Invalid guess! Please enter two digits between 0 and 9.');
          resolve(null);
        }
      });
    });
  }
}

// CPU Player class
class CPUPlayer extends Player {
  constructor() {
    super('CPU');
    this.mode = 'hunt';
    this.targetQueue = [];
  }

  makeGuess() {
    let guess;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      guess = this.targetQueue.shift();
      if (this.guesses.has(guess)) {
        if (this.targetQueue.length === 0) this.mode = 'hunt';
        return this.makeGuess();
      }
    } else {
      this.mode = 'hunt';
      do {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        guess = `${row}${col}`;
      } while (this.guesses.has(guess));
    }

    this.guesses.add(guess);
    return guess;
  }

  processHit(guess) {
    if (this.mode === 'hunt') {
      this.mode = 'target';
      const [row, col] = guess.split('').map(Number);

      const adjacent = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 }
      ];

      for (const adj of adjacent) {
        if (adj.r >= 0 && adj.r < BOARD_SIZE &&
            adj.c >= 0 && adj.c < BOARD_SIZE) {
          const adjGuess = `${adj.r}${adj.c}`;
          if (!this.guesses.has(adjGuess)) {
            this.targetQueue.push(adjGuess);
          }
        }
      }
    }
  }

  processMiss() {
    if (this.mode === 'target' && this.targetQueue.length === 0) {
      this.mode = 'hunt';
    }
  }
}

// Game class to manage the overall game state and flow
class Game {
  constructor() {
    this.player = new HumanPlayer();
    this.cpu = new CPUPlayer();
    this.setupGame();
  }

  setupGame() {
    this.player.board.placeShipsRandomly(NUM_SHIPS);
    this.cpu.board.placeShipsRandomly(NUM_SHIPS);
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${NUM_SHIPS} enemy ships.`);
  }

  printBoards() {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    const header = '  ' + Array(BOARD_SIZE).fill().map((_, i) => i).join(' ');
    console.log(header + '     ' + header);

    for (let i = 0; i < BOARD_SIZE; i++) {
      let rowStr = i + ' ';

      // Opponent's board
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.cpu.board.grid[i][j];
        rowStr += (cell === 'S' ? '~' : cell) + ' ';
      }

      rowStr += '    ' + i + ' ';

      // Player's board
      for (let j = 0; j < BOARD_SIZE; j++) {
        rowStr += this.player.board.grid[i][j] + ' ';
      }

      console.log(rowStr);
    }
    console.log('\n');
  }

  async playTurn() {
    // Player's turn
    const playerGuess = await this.player.makeGuess();
    if (playerGuess) {
      const result = this.cpu.board.processGuess(playerGuess);
      if (result.hit) {
        if (result.alreadyHit) {
          console.log('You already hit that spot!');
        } else {
          console.log('PLAYER HIT!');
          if (result.sunk) {
            console.log('You sunk an enemy battleship!');
          }
        }
      } else {
        console.log('PLAYER MISS.');
      }
    }

    // CPU's turn
    const cpuGuess = this.cpu.makeGuess();
    console.log(`\n--- CPU's Turn ---`);
    console.log(`CPU targets: ${cpuGuess}`);

    const cpuResult = this.player.board.processGuess(cpuGuess);
    if (cpuResult.hit) {
      if (cpuResult.alreadyHit) {
        console.log('CPU already hit that spot!');
      } else {
        console.log(`CPU HIT at ${cpuGuess}!`);
        this.cpu.processHit(cpuGuess);
        if (cpuResult.sunk) {
          console.log('CPU sunk your battleship!');
          this.cpu.mode = 'hunt';
          this.cpu.targetQueue = [];
        }
      }
    } else {
      console.log(`CPU MISS at ${cpuGuess}.`);
      this.cpu.processMiss();
    }
  }

  async gameLoop() {
    while (true) {
      this.printBoards();

      if (this.cpu.board.getRemainingShips() === 0) {
        console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
        this.printBoards();
        break;
      }

      if (this.player.board.getRemainingShips() === 0) {
        console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
        this.printBoards();
        break;
      }

      await this.playTurn();
    }
  }
}

// Export classes for testing
module.exports = {
  Ship,
  Board,
  Player,
  HumanPlayer,
  CPUPlayer,
  Game
};

// Start the game if this file is run directly
if (require.main === module) {
  const game = new Game();
  game.gameLoop();
}
