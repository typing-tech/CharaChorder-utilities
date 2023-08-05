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
  "RH_THUMB_2": ['x', 'b', 'q', 'DUP'],
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
const CHORD_GENERATORS = [
  'onlyCharsGenerator',
  'useMirroredCharsGenerator',
  'useAltKeysGenerator',
  'use3dKeysGenerator'
];

let minChordLength = 2;
let maxChordLength = 6;
let createCsvFile = true;

function generateChords() {
  createCsvFile = document.getElementById('createCsv').checked;
  let wordFileInput = document.getElementById('wordFileInput');
  let wordFile = wordFileInput.files[0];
  let words = [];

  if (wordFile) {
    let reader = new FileReader();

    reader.onload = function (event) {
      words = event.target.result.split('\n');
      startChordGeneration(words);
    };

    reader.readAsText(wordFile);
  } else {
    let word = document.getElementById('textInput').value;
    if (word) {
      words = word.split(',').map(s => s.trim());
      startChordGeneration(words);
    } else {
      console.log("No wordFile or text input");
      return;
    }
  }
}

async function startChordGeneration(words) {
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  const progressLabel = document.getElementById('progress-label');
  let generator = new ChordGenerator(words);

  console.log("Generating chords...");
  let chords = await generator.generate(progress => {
    progressBar.style.width = `${progress * 100}%`;
    progressLabel.textContent = `${Math.round(progress * 100)}%`;
  });

  if (createCsvFile) {
    createCsv(chords);
  } else {
    createChordsTable(chords);
  }
  progressLabel.textContent = "Chord generation complete!";
}

function createCsv(chords) {
  let csvContent = "";
  for (const [word, chord] of Object.entries(chords)) {
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

function createChordsTable(chords) {
  let table = document.createElement('table');
  let header = table.createTHead();
  let row = header.insertRow(0);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  cell1.innerHTML = "<b>Word</b>";
  cell2.innerHTML = "<b>Chord</b>";

  for (let word in chords) {
    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = word;
    cell2.innerHTML = chords[word].sort().join(" + ");
  }

  let outputDiv = document.getElementById('output-chord');
  outputDiv.innerHTML = "";
  table.style.margin = "10%";
  outputDiv.appendChild(table);
}

class ChordGenerator {
  constructor(words) {
    this.onlyChars = true;
    this.useMirroredChars = true;
    this.use3dKeys = true;
    this.useAltKeys = true;
    this.usedChords = {};
    this.uploadedChords = {};
    this.words = [...new Set(words.map(word => word.toLowerCase()))];
  }

  generate(onProgress) {
    return this.loadUploadedChords()
      .then(() => {
        const totalWords = this.wordsList().length;

        this.useMirroredChars = document.getElementById('useMirroredChars').checked;
        this.use3dKeys = document.getElementById('use3dKeys').checked;
        this.useAltKeys = document.getElementById('useAltKeys').checked;

        return new Promise(resolve => {
          const processWord = (index) => {
            if (index >= totalWords) {
              resolve(this.usedChords);
              return;
            }

            const word = this.wordsList()[index];
            const chord = this.calculateChord(this.getChars(word));
            if (chord) {
              this.assignChord(word, chord.sort());
            } else {
              console.log("Could not generate chord for", word);
            }

            onProgress((index + 1) / totalWords);
            requestAnimationFrame(() => processWord(index + 1));
          };

          processWord(0);
        });
      });
  }

  wordsList() {
    let list = LENGTH_PROPORTIONAL ? this.sortedWords() : this.words;

    return list.filter(word => word.length >= MIN_WORD_LENGTH);
  }

  loadUploadedChords() {
    return new Promise((resolve, reject) => {
      let chordFileInput = document.getElementById('chordFileInput');
      let chordFile = chordFileInput.files[0];
      if (!chordFile) {
        resolve();
        return;
      }

      var reader = new FileReader();
      reader.onload = (event) => {
        var content = event.target.result;
        var lines = content.split('\n');

        lines.forEach((line) => {
          var parts = line.split(',');
          if (parts.length === 2) {
            var chord = parts[0].trim().split(' + ');
            var word = parts[1].trim();
            this.uploadedChords[word] = chord;
          }
        });

        resolve();
      };

      reader.onerror = reject;
      reader.readAsText(chordFile);
    });
  }


  calculateChord(chars) {
    for (const generator of CHORD_GENERATORS) {
      const option = generator.replace('Generator', '');
      if (this[option]) {
        const chord = this[generator](chars);
        if (chord) return chord;
      }
    }
    return null;
  }

  getChars(word) {
    const chars = word.split("").filter(str => str !== " ");;
    const uniq_chars = chars.length > new Set(chars).size ? ["DUP", ...new Set(chars)] : [...new Set(chars)];
    const validChars = Object.values(KEY_FINGER_MAP).flat();

    return uniq_chars.filter(char => validChars.includes(char));
  }

  assignChord(word, chord) {
    this.usedChords[word] = chord;
  }


  onlyCharsGenerator(chars) {
    for (const chord of this.allCombinations(chars)) {
      if (this.validChord(chord)) return chord;
    }
  }

  useMirroredCharsGenerator(chars) {
    for (const chord of this.allCombinations([...new Set([...chars, ...this.mirrorKeys(chars)])])) {
      if (this.validChord(chord)) return chord;
    }
  }

  use3dKeysGenerator(chars) {
    for (const chord of this.allCombinations([...new Set([...chars, ...this.threeDKeys(chars)])])) {
      if (this.validChord(chord)) return chord;
    }
  }

  useAltKeysGenerator(chars) {
    for (const chord of this.allCombinations([...new Set([...chars, ...ALT_KEYS])])) {
      if (this.validChord(chord)) return chord;
    }
  }

  validChord(chord) {
    return !this.fingerConflict(chord) && !this.usedChord(chord) && !this.uploadedChord(chord);
  }

  powerSet(chars) {
    const result = [[]];

    for (const value of chars) {
      const length = result.length;

      for (let i = 0; i < length; i++) {
        const subset = result[i];
        result.push(subset.concat(value));
      }
    }

    return result;
  }

  allCombinations(chars) {
    return this.powerSet(chars)
      .filter(subset => subset.length >= minChordLength && subset.length <= maxChordLength)
      .sort((a, b) => a.length - b.length);
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

  uploadedChord(chord) {
    const sortedChord = [...chord].sort();
    return Object.values(this.uploadedChord).some(uploadedChord => {
      const sortedUsedChord = [...usedChord].sort();
      return JSON.stringify(sortedUsedChord) === JSON.stringify(sortedChord);
    });
  }

  mirrorKeys(chord) {
    return chord.map(char => KEY_MIRROR_MAP_L[char] || KEY_MIRROR_MAP_R[char]);
  }

  threeDKeys(chord) {
    return chord.map(char => this.getThreeDKey(char));
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

$(function () {
  $("#slider-range").slider({
    range: true,
    min: 1,
    max: 10,
    values: [minChordLength, maxChordLength],
    slide: function (event, ui) {
      $("#selected-values").text("Selected range: " + ui.values[0] + " - " + ui.values[1]);
      minChordLength = ui.values[0];
      maxChordLength = ui.values[1];
    }
  });
});

document.getElementById('wordFileInput').addEventListener('change', function () {
  document.getElementById('wordFileInputName').textContent = this.files[0].name;
});

document.getElementById('chordFileInput').addEventListener('change', function () {
  document.getElementById('chordFileInputName').textContent = this.files[0].name;
});