let minChordLength = 2;
let maxChordLength = 6;
const MIN_WORD_LENGTH = 2;
const ALT_KEYS = ['LEFT_ALT', 'RIGHT_ALT'];
const LENGTH_PROPORTIONAL = false;
const KEY_MIRROR_MAP_L = {
  ",": ";",
  "u": "s",
  "'": "y",
  ".": "j",
  "o": "n",
  "i": "l",
  "e": "t",
  "SPACE": "SPACE",
  "BKSP": "ENTER",
  "r": "a",
  "v": "p",
  "m": "h",
  "c": "d",
  "k": "f",
  "z": "q",
  "w": "b",
  "g": "DUP",
  "x": null
};
const KEY_MIRROR_MAP_R = Object.fromEntries(Object.entries(KEY_MIRROR_MAP_L).map(([key, value]) => [value, key]));
const KEY_FINGER_MAP = {
  "LH_PINKY": ['LEFT_ALT'],
  "LH_RING_1": [',', 'u', "'"],
  "LH_MID_1": ['.', 'o', 'i'],
  "LH_INDEX": ['e', 'r', 'SPACE', 'BKSP'],
  "LH_THUMB_1": ['m', 'v', 'k', 'c'],
  "LH_THUMB_2": ['g', 'z', 'w'],
  "RH_THUMB_2": ['x', 'b', 'q'],
  "RH_THUMB_1": ['p', 'f', 'd', 'h'],
  "RH_INDEX": ['a', 't', 'SPACE', 'ENTER'],
  "RH_MID_1": ['l', 'n', 'j'],
  "RH_RING_1": ['y', 's', ';'],
  "RH_PINKY": ['RIGHT_ALT']
};
const CONFLICTING_FINGER_GROUPS = {
  "LH_PINKY": ['LEFT_ALT', 'LH_PINKY_3D'],
  "LH_RING_1": [',', 'u', "'", 'LH_RING_1_3D'],
  "LH_MID_1": ['.', 'o', 'i', 'LH_MID_1_3D'],
  "LH_INDEX": ['e', 'r', 'LH_INDEX_3D', 'SPACE', 'BKSP'],
  "LH_THUMB": ['m', 'v', 'k', 'c', 'LH_THUMB_1_3D', 'g', 'z', 'w', 'LH_THUMB_1_3D'],
  "RH_THUMB": ['x', 'b', 'q', 'DUP', 'RH_THUMB_1_3D', 'p', 'f', 'd', 'h', 'RH_THUMB_2_3D'],
  "RH_INDEX": ['a', 't', 'RH_INDEX_3D', 'SPACE', 'ENTER'],
  "RH_MID_1": ['l', 'n', 'j', 'RH_MID_1_3D'],
  "RH_RING_1": ['y', 's', ';', 'RH_RING_1_3D'],
  "RH_PINKY": ['RIGHT_ALT', 'RH_PINKY_3D']
};
const CHORD_GENERATOR_LOGIC = [
  'skipKeys',
  'allKeys',
  'skipWithMirrorKeys',
  'allWithMirrorKeys',
  'skipWithAltKeys',
  'allWithAltKeys',
  'skipWith3dKeys',
  'allWith3dKeys'
];

function generateChords() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';

  const reader = new FileReader();
  reader.onload = function (event) {
    const words = event.target.result.split('\n');
    const generator = new ChordGenerator(words);
    generator.generate();
  };
  reader.readAsText(file);
}


class ChordGenerator {
  constructor(words) {
    this.usedChords = {};
    this.words = [...new Set(words.map(word => word.toLowerCase()))];
  }

  generate() {
    const progressBar = document.getElementById('progress-bar');
    const totalWords = this.wordsList().length;

    const processWord = (index) => {
      if (index >= totalWords) {
        this.createCsv();
        document.getElementById('download-link').style.display = 'block';
        return;
      }

      const word = this.wordsList()[index];
      if (word === null) throw "Word is blank";
      if (word.length >= MIN_WORD_LENGTH) {
        const chord = this.calculateChord(this.getChars(word));
        if (chord) {
          this.assignChord(word, chord.sort());
        } else {
          console.log("Could not generate chord for", word);
        }
      }

      const progress = (index + 1) / totalWords * 100;
      progressBar.style.width = `${progress}%`;

      requestAnimationFrame(() => processWord(index + 1));
    };

    processWord(0);
  }


  createCsv() {
    let csvContent = "";
    for (const [word, chord] of Object.entries(this.usedChords)) {
      csvContent += `${chord.join('+')},${word}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "chords.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  wordsList() {
    return LENGTH_PROPORTIONAL ? this.sortedWords() : this.words;
  }

  calculateChord(chars) {
    for (const logic of CHORD_GENERATOR_LOGIC) {
      const chord = this[logic](chars);
      if (chord) return chord;
    }
    return null;
  }

  getChars(word) {
    const chars = word.split("");
    return chars.length > new Set(chars).size ? ["DUP", ...new Set(chars)] : [...new Set(chars)];
  }


  assignChord(word, chord) {
    this.usedChords[word] = chord;
  }

  skipKeys(chars) {
    return this.processKeys(chars, true);
  }

  allKeys(chars) {
    return this.processKeys(chars, false);
  }

  skipWithMirrorKeys(chars) {
    return this.useMirrorKeys(chars, true);
  }

  allWithMirrorKeys(chars) {
    return this.useMirrorKeys(chars, false);
  }

  skipWith3dKeys(chars) {
    return this.use3dKeys(chars, true);
  }

  allWith3dKeys(chars) {
    return this.use3dKeys(chars, false);
  }
  skipWithAltKeys(chars) {
    return this.useAltKeys(chars, true);
  }

  allWithAltKeys(chars) {
    return this.useAltKeys(chars, false);
  }

  useMirrorKeys(chars, skip) {
    return this.processCombinations(chars, this.mirrorKeyCombinations, skip);
  }

  use3dKeys(chars, skip) {
    return this.processCombinations(chars, this.threeDKeyCombinations, skip);
  }

  useAltKeys(chars, skip) {
    for (const altKey of ALT_KEYS) {
      const charsWithAlt = [altKey, ...chars];
      const chord = this.processKeys(charsWithAlt, skip);
      if (chord) return chord;
    }
    return null;
  }

  processKeys(chars, skip) {
    const chord = [];
    for (const char of chars) {
      chord.push(char);
      if (chord.length < minChordLength) continue;
      if (chord.length > maxChordLength) return null;

      if (this.fingerConflict(chord) || this.usedChord(chord)) {
        if (skip) chord.pop();
        continue;
      }
      return chord;
    }
    return null;
  }


  processCombinations(chars, combinationFn, skip) {
    const chord = [];
    for (const char of chars) {
      chord.push(char);
      if (chord.length < minChordLength) continue;
      if (chord.length > maxChordLength) return null;

      for (const combination of combinationFn.call(this, chord)) {
        if (!this.fingerConflict(combination) && !this.usedChord(combination)) return combination;
      }
      if (skip) chord.pop();
    }
    return null;
  }

  fingerConflict(chord) {
    if (this.hasDuplicates(chord)) return true;
    return Object.values(CONFLICTING_FINGER_GROUPS).some((fingerKeys) => fingerKeys.filter((key) => chord.includes(key)).length > 1);
  }

  hasDuplicates(chord) {
    return chord.length > new Set(chord).size;
  }

  usedChord(chord) {
    const sortedChord = [...chord].sort();
    return Object.values(this.usedChords).some(usedChord => {
      const sortedUsedChord = [...usedChord].sort();
      return JSON.stringify(sortedUsedChord) === JSON.stringify(sortedChord);
    });
  }

  mirrorKeyCombinations(chord) {
    let combinations = [[]];
    for (const char of chord) {
      const mirrorKey = KEY_MIRROR_MAP_L[char] || KEY_MIRROR_MAP_R[char];
      combinations = combinations.flatMap((combination) => [combination.concat(char), combination.concat(mirrorKey)].filter((comb) => comb.every(Boolean)));
    }
    return combinations;
  }

  threeDKeyCombinations(chord) {
    let combinations = [[]];
    for (const char of chord) {
      const threeDKey = this.getThreeDKey(char);
      if (!threeDKey) continue;
      combinations = combinations.flatMap((combination) => [combination.concat(char), combination.concat(threeDKey)].filter((comb) => comb.every(Boolean)));
    }
    return combinations;
  }

  getThreeDKey(char) {
    for (const [finger, chars] of Object.entries(KEY_FINGER_MAP)) {
      if (chars.includes(char)) return `${finger}_3D`;
    }
    return null;
  }

  sortedWords() {
    return this.words.map((word, index) => [word, index]).sort(([aWord], [bWord]) => aWord.length - bWord.length || aWord.localeCompare(bWord)).map(([word]) => word);
  }
}

$(function() {
  $("#slider-range").slider({
    range: true,
    min: 1,
    max: 10,
    values: [minChordLength, maxChordLength],
    slide: function(event, ui) {
      $("#selected-values").text("Selected range: " + ui.values[0] + " - " + ui.values[1]);
      minChordLength = ui.values[0];
      maxChordLength = ui.values[1];
    }
  });
});
