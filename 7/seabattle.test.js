const { Ship, Board, Player, HumanPlayer, CPUPlayer, Game } = require('./seabattle');

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  test('should initialize with empty locations and hits', () => {
    expect(ship.locations).toEqual([]);
    expect(ship.hits).toEqual([]);
  });

  test('should add location correctly', () => {
    ship.addLocation('00');
    expect(ship.locations).toContain('00');
    expect(ship.hits).toHaveLength(1);
    expect(ship.hits[0]).toBe('');
  });

  test('should correctly identify sunk ship', () => {
    ship.addLocation('00');
    ship.addLocation('01');
    ship.addLocation('02');

    expect(ship.isSunk()).toBe(false);

    ship.hits = ['hit', 'hit', 'hit'];
    expect(ship.isSunk()).toBe(true);
  });
});

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  test('should initialize with empty grid', () => {
    expect(board.grid).toHaveLength(10);
    expect(board.grid[0]).toHaveLength(10);
    expect(board.grid[0][0]).toBe('~');
  });

  test('should place ship correctly', () => {
    const ship = new Ship();
    const locations = ['00', '01', '02'];

    board.placeShip(ship, locations);

    expect(board.ships).toContain(ship);
    expect(board.grid[0][0]).toBe('S');
    expect(board.grid[0][1]).toBe('S');
    expect(board.grid[0][2]).toBe('S');
  });

  test('should process valid guess correctly', () => {
    const ship = new Ship();
    board.placeShip(ship, ['00', '01', '02']);

    const result = board.processGuess('00');
    expect(result.hit).toBe(true);
    expect(result.alreadyHit).toBe(false);
    expect(board.grid[0][0]).toBe('X');
  });

  test('should process miss correctly', () => {
    const result = board.processGuess('99');
    expect(result.hit).toBe(false);
    expect(result.alreadyHit).toBe(false);
    expect(board.grid[9][9]).toBe('O');
  });

  test('should detect already hit locations', () => {
    const ship = new Ship();
    board.placeShip(ship, ['00']);
    board.processGuess('00');

    const result = board.processGuess('00');
    expect(result.hit).toBe(true);
    expect(result.alreadyHit).toBe(true);
  });

  test('should place ships randomly', () => {
    board.placeShipsRandomly(3);
    expect(board.ships).toHaveLength(3);
    expect(board.ships.every(ship => ship.locations.length === 3)).toBe(true);
  });

  test('should handle invalid ship placement', () => {
    const ship = new Ship();
    const invalidLocations = ['99', '98', '97']; // Out of bounds
    expect(() => board.placeShip(ship, invalidLocations)).not.toThrow();
  });

  test('should get remaining ships count correctly', () => {
    const ship1 = new Ship();
    const ship2 = new Ship();
    board.placeShip(ship1, ['00', '01', '02']);
    board.placeShip(ship2, ['50', '51', '52']);

    expect(board.getRemainingShips()).toBe(2);

    ship1.hits = ['hit', 'hit', 'hit'];
    expect(board.getRemainingShips()).toBe(1);
  });
});

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer');
  });

  test('should initialize with correct properties', () => {
    expect(player.name).toBe('TestPlayer');
    expect(player.board).toBeInstanceOf(Board);
    expect(player.guesses).toBeInstanceOf(Set);
  });

  test('should validate guesses correctly', () => {
    expect(player.isValidGuess('00')).toBe(true);
    expect(player.isValidGuess('99')).toBe(true);
    expect(player.isValidGuess('100')).toBe(false);
    expect(player.isValidGuess('0')).toBe(false);
    expect(player.isValidGuess('aa')).toBe(false);
  });
});

describe('CPUPlayer', () => {
  let cpu;

  beforeEach(() => {
    cpu = new CPUPlayer();
  });

  test('should initialize in hunt mode', () => {
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should make valid guesses', () => {
    const guess = cpu.makeGuess();
    expect(guess).toMatch(/^[0-9]{2}$/);
    expect(cpu.guesses.has(guess)).toBe(true);
  });

  test('should switch to target mode after hit', () => {
    cpu.processHit('00');
    expect(cpu.mode).toBe('target');
    expect(cpu.targetQueue.length).toBeGreaterThan(0);
  });

  test('should switch back to hunt mode after miss with empty queue', () => {
    cpu.mode = 'target';
    cpu.targetQueue = [];
    cpu.processMiss();
    expect(cpu.mode).toBe('hunt');
  });

  test('should maintain target queue after hit', () => {
    // First hit should switch to target mode and add adjacent cells
    cpu.processHit('55');
    expect(cpu.mode).toBe('target');
    expect(cpu.targetQueue.length).toBeGreaterThan(0);

    // Verify that adjacent cells are in the queue
    const adjacentCells = ['45', '65', '54', '56'];
    const hasAdjacentCells = adjacentCells.some(cell => cpu.targetQueue.includes(cell));
    expect(hasAdjacentCells).toBe(true);
  });

  test('should not add duplicate targets to queue', () => {
    cpu.processHit('55');
    const initialQueue = [...cpu.targetQueue];
    cpu.processHit('55');
    expect(cpu.targetQueue).toEqual(initialQueue);
  });

  test('should make unique guesses', () => {
    const guesses = new Set();
    for (let i = 0; i < 10; i++) {
      const guess = cpu.makeGuess();
      expect(guesses.has(guess)).toBe(false);
      guesses.add(guess);
    }
  });
});

describe('HumanPlayer', () => {
  let player;
  let rl;

  beforeEach(() => {
    player = new HumanPlayer();
  });

  afterEach(() => {
    if (rl) {
      rl.close();
    }
  });

  test('should make valid guess', async () => {
    const mockGuess = '00';
    rl = {
      question: jest.fn().mockImplementation((_, callback) => callback(mockGuess)),
      close: jest.fn()
    };

    const readline = require('readline');
    jest.spyOn(readline, 'createInterface').mockReturnValue(rl);

    const guess = await player.makeGuess();
    expect(guess).toBe(mockGuess);
    expect(rl.close).toHaveBeenCalled();
  });

  test('should handle invalid guess', async () => {
    const mockGuess = 'invalid';
    rl = {
      question: jest.fn().mockImplementation((_, callback) => callback(mockGuess)),
      close: jest.fn()
    };

    const readline = require('readline');
    jest.spyOn(readline, 'createInterface').mockReturnValue(rl);

    const guess = await player.makeGuess();
    expect(guess).toBeNull();
    expect(rl.close).toHaveBeenCalled();
  });
});

describe('Game', () => {
  let game;
  let rl;

  beforeEach(() => {
    game = new Game();
  });

  afterEach(() => {
    if (rl) {
      rl.close();
    }
    jest.restoreAllMocks();
  });

  test('should initialize with player and CPU', () => {
    expect(game.player).toBeInstanceOf(HumanPlayer);
    expect(game.cpu).toBeInstanceOf(CPUPlayer);
  });

  test('should set up game correctly', () => {
    expect(game.player.board.ships).toHaveLength(3);
    expect(game.cpu.board.ships).toHaveLength(3);
  });

  test('should correctly identify game over conditions', () => {
    // Simulate all CPU ships being sunk
    game.cpu.board.ships.forEach(ship => {
      ship.hits = Array(ship.locations.length).fill('hit');
    });
    expect(game.cpu.board.getRemainingShips()).toBe(0);

    // Simulate all player ships being sunk
    game.player.board.ships.forEach(ship => {
      ship.hits = Array(ship.locations.length).fill('hit');
    });
    expect(game.player.board.getRemainingShips()).toBe(0);
  });

  test('should handle player turn correctly', async () => {
    // Mock readline
    rl = {
      question: jest.fn().mockImplementation((_, callback) => callback('00')),
      close: jest.fn()
    };
    const readline = require('readline');
    jest.spyOn(readline, 'createInterface').mockReturnValue(rl);

    // Mock the player's board and CPU's board
    const mockShip = new Ship();
    mockShip.addLocation('00');
    game.cpu.board.ships = [mockShip];

    await game.playTurn();

    expect(game.cpu.board.grid[0][0]).toBe('X');
    expect(rl.close).toHaveBeenCalled();
  });

  test('should handle CPU turn correctly', async () => {
    // Mock readline
    rl = {
      question: jest.fn().mockImplementation((_, callback) => callback('00')),
      close: jest.fn()
    };
    const readline = require('readline');
    jest.spyOn(readline, 'createInterface').mockReturnValue(rl);

    // Mock the player's board
    const mockShip = new Ship();
    mockShip.addLocation('00');
    game.player.board.ships = [mockShip];

    // Mock the CPU's makeGuess method
    const originalMakeGuess = game.cpu.makeGuess;
    game.cpu.makeGuess = jest.fn().mockReturnValue('00');

    await game.playTurn();

    expect(game.cpu.makeGuess).toHaveBeenCalled();
    expect(game.player.board.grid[0][0]).toBe('X');
    expect(rl.close).toHaveBeenCalled();

    // Restore original method
    game.cpu.makeGuess = originalMakeGuess;
  });

  test('should print boards correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    game.printBoards();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});