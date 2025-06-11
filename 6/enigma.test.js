const { Enigma } = require('./enigma');

describe('Enigma Machine', () => {
  // Test case 1: Basic encryption/decryption
  test('should correctly encrypt and decrypt a message', () => {
    const enigma = new Enigma(
      [0, 1, 2], // Rotor IDs
      [0, 0, 0], // Rotor positions
      [0, 0, 0], // Ring settings
      [] // No plugboard pairs
    );

    const message = 'HELLO';
    const encrypted = enigma.process(message);

    // Reset the machine with same settings
    const enigma2 = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      []
    );

    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test case 2: With plugboard
  test('should work correctly with plugboard settings', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      [['A', 'B'], ['C', 'D']]
    );

    const message = 'HELLO';
    const encrypted = enigma.process(message);

    const enigma2 = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      [['A', 'B'], ['C', 'D']]
    );

    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test case 3: Different rotor positions
  test('should work with different rotor positions', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [1, 2, 3],
      [0, 0, 0],
      []
    );

    const message = 'HELLO';
    const encrypted = enigma.process(message);

    const enigma2 = new Enigma(
      [0, 1, 2],
      [1, 2, 3],
      [0, 0, 0],
      []
    );

    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test case 4: Different ring settings
  test('should work with different ring settings', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [1, 2, 3],
      []
    );

    const message = 'HELLO';
    const encrypted = enigma.process(message);

    const enigma2 = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [1, 2, 3],
      []
    );

    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test case 5: Long message
  test('should handle longer messages correctly', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      []
    );

    const message = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
    const encrypted = enigma.process(message);

    const enigma2 = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      []
    );

    const decrypted = enigma2.process(encrypted);
    expect(decrypted).toBe(message);
  });
});