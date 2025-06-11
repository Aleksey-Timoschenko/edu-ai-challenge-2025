const readline = require('readline');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function mod(n, m) {
  return ((n % m) + m) % m;
}

const ROTORS = [
  { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // Rotor I
  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // Rotor II
  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // Rotor III
];

// Fixed reflector implementation - each letter maps to another and vice versa
const REFLECTOR = {
  'A': 'Y', 'Y': 'A',
  'B': 'R', 'R': 'B',
  'C': 'U', 'U': 'C',
  'D': 'H', 'H': 'D',
  'E': 'Q', 'Q': 'E',
  'F': 'S', 'S': 'F',
  'G': 'L', 'L': 'G',
  'I': 'P', 'P': 'I',
  'J': 'X', 'X': 'J',
  'K': 'N', 'N': 'K',
  'M': 'O', 'O': 'M',
  'T': 'Z', 'Z': 'T',
  'V': 'W', 'W': 'V'
};

function plugboardSwap(c, pairs) {
  for (const [a, b] of pairs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
    this.wiring = wiring;
    this.notch = notch;
    this.ringSetting = ringSetting;
    this.position = position;
  }

  step() {
    this.position = mod(this.position + 1, 26);
  }

  atNotch() {
    return alphabet[this.position] === this.notch;
  }

  forward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    const out = this.wiring[idx];
    return alphabet[mod(alphabet.indexOf(out) - this.position + this.ringSetting, 26)];
  }

  backward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    const out = alphabet[this.wiring.indexOf(alphabet[idx])];
    return alphabet[mod(alphabet.indexOf(out) - this.position + this.ringSetting, 26)];
  }
}

class Enigma {
  constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
    this.rotors = rotorIDs.map(
      (id, i) =>
        new Rotor(
          ROTORS[id].wiring,
          ROTORS[id].notch,
          ringSettings[i],
          rotorPositions[i],
        ),
    );
    this.plugboardPairs = plugboardPairs;
  }

  stepRotors() {
    // Implement double-stepping mechanism
    const rightRotorAtNotch = this.rotors[2].atNotch();
    const middleRotorAtNotch = this.rotors[1].atNotch();

    if (middleRotorAtNotch) {
      this.rotors[0].step();
      this.rotors[1].step();
    } else if (rightRotorAtNotch) {
      this.rotors[1].step();
    }
    this.rotors[2].step();
  }

  encryptChar(c) {
    if (!alphabet.includes(c)) return c;

    this.stepRotors();
    c = plugboardSwap(c, this.plugboardPairs);

    // Forward through rotors
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    // Through reflector
    c = REFLECTOR[c] || c;

    // Backward through rotors
    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    return plugboardSwap(c, this.plugboardPairs);
  }

  process(text) {
    return text
      .toUpperCase()
      .split('')
      .map((c) => this.encryptChar(c))
      .join('');
  }
}

function promptEnigma() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter message: ', (message) => {
    rl.question('Rotor positions (e.g. 0 0 0): ', (posStr) => {
      const rotorPositions = posStr.split(' ').map(Number);
      rl.question('Ring settings (e.g. 0 0 0): ', (ringStr) => {
        const ringSettings = ringStr.split(' ').map(Number);
        rl.question('Plugboard pairs (e.g. AB CD): ', (plugStr) => {
          const plugPairs =
            plugStr
              .toUpperCase()
              .match(/([A-Z]{2})/g)
              ?.map((pair) => [pair[0], pair[1]]) || [];

          const enigma = new Enigma(
            [0, 1, 2],
            rotorPositions,
            ringSettings,
            plugPairs,
          );
          const result = enigma.process(message);
          console.log('Output:', result);
          rl.close();
        });
      });
    });
  });
}

if (require.main === module) {
  promptEnigma();
}

module.exports = { Enigma };
