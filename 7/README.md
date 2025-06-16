# Sea Battle Game

A modern implementation of the classic Sea Battle game using JavaScript.

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd sea-battle
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Game

To start the game, run:
```sh
node seabattle.js
```

Follow the on-screen instructions to play the game. You will be prompted to enter your guesses in the format `00`, `34`, etc.

## Testing the Game

### Running Tests

To run the tests, use the following command:
```sh
npm test
```

### Running Tests with Coverage

To run the tests and generate a coverage report, use:
```sh
npm run test:coverage
```

The coverage report will be written to `test_report.txt`.

## Project Structure

- `seabattle.js`: Main game logic and entry point.
- `seabattle.test.js`: Test suite for the game.
- `package.json`: Project configuration and dependencies.
- `jest.config.js`: Jest configuration for testing.
- `README.md`: This file.

## License

This project is licensed under the MIT License.