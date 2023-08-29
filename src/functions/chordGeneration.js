const MIN_WORD_LENGTH = 2;
const ALT_KEYS = ['LEFT_ALT', 'RIGHT_ALT'];
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
    "g": null,
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
const CONFLICTING_FINGER_GROUPS_DOUBLE = {
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
const CONFLICTING_FINGER_GROUPS_TRIPLE = {
    "group_1": ['a', 'n', 'y'],
    "group_2": ['r', 'o', "'"]
}
const CHORD_GENERATORS = [
    'onlyCharsGenerator',
    'useMirroredKeysGenerator',
    'useAltKeysGenerator',
    'use3dKeysGenerator'
];
const UNUSABLE_CHORDS = {
    "impulse_chord": ['DUP', 'i']
};

export async function generateChords(words, sliderValue, checkboxStates, chordLibrary) {
    const settings = {
        useDupKey: checkboxStates.useDupKey,
        useMirroredKeys: checkboxStates.useMirroredKeys,
        useAltKeys: checkboxStates.useAltKeys,
        use3dKeys: checkboxStates.use3dKeys,
        sliderValue: sliderValue,
        chordLibrary: chordLibrary
    };
    let generator = new ChordGenerator(words, settings);
    let chords = await generator.generate();
    if (checkboxStates.createCsv) {
        createCsv(chords);
    }
    return chords;
}

function createCsv(chords) {
    let csvContent = Object.entries(chords)
        .map(([word, chord]) => `${chord.join(' + ')},${word}`)
        .join('\n');

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

class ChordGenerator {
    constructor(words, settings) {
        this.onlyChars = true;
        this.useDupKey = settings.useDupKey;
        this.useMirroredKeys = settings.useMirroredKeys;
        this.useAltKeys = settings.useAltKeys;
        this.use3dKeys = settings.use3dKeys;
        this.minChordLength = settings.sliderValue[0];
        this.maxChordLength = settings.sliderValue[1];
        this.chordLibrary = settings.chordLibrary;
        this.usedChords = {};
        this.uploadedChords = new Map();
        this.words = [...new Set(words.map(word => word.toLowerCase()))];
    }

    async generate() {
        await this.loadUploadedChords();
        const totalWords = this.wordsList().length;
        for (let index = 0; index < totalWords; index++) {
            const word = this.wordsList()[index];
            // Skip if the word is already in chordLibrary
            if (this.uploadedChords.has(word)) {
                console.log(`Skipping '${word}' because it already in chordLibrary.`);
                continue;
            }

            const chord = this.calculateChord(this.getChars(word));
            if (chord) {
                this.assignChord(word, chord.sort().reverse());
            } else {
                console.log("Could not generate chord for", word);
            }
        }
        return this.usedChords;
    }

    wordsList() {
        return this.words.filter(word => word.length >= MIN_WORD_LENGTH);
    }

    loadUploadedChords() {
        return new Promise((resolve, reject) => {
            try {
                if (!this.chordLibrary || !Array.isArray(this.chordLibrary)) {
                    console.warn('chordLibrary is not properly initialized.');
                    resolve();
                    return;
                }

                this.chordLibrary.forEach((entry) => {
                    if (entry.chordInput && entry.chordOutput) {
                        const chord = entry.chordInput.trim().split(' + ');
                        const word = entry.chordOutput.trim();

                        if (this.uploadedChords.has(word)) {
                            this.uploadedChords.get(word).push(chord);
                        } else {
                            this.uploadedChords.set(word, [chord]);
                        }
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }


    calculateChord(chars) {
        for (const generator of CHORD_GENERATORS) {
            const option = generator.replace('Generator', '');
            if (this[option]) {
                const chord = this[generator](chars);
                if (chord) {
                    const reversedChord = chord.sort().reverse();
                    return reversedChord;
                }

            }
        }
        return null;
    }

    getChars(word) {
        const chars = word.split("").filter(str => str !== " ");
        let uniq_chars = [...new Set(chars)];
        if (uniq_chars.length < chars.length && this.useDupKey) {
            uniq_chars = [...new Set(chars), "DUP"]
        }
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

    useMirroredKeysGenerator(chars) {
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
            .filter(subset => subset.length >= this.minChordLength && subset.length <= this.maxChordLength)
            .sort((a, b) => a.length - b.length);
    }

    fingerConflict(chord) {
        const sortedChord = [...chord].sort();
        if (this.hasDuplicates(chord)) return true;
        if (Object.values(CONFLICTING_FINGER_GROUPS_DOUBLE).some((fingerKeys) => fingerKeys.filter((key) => chord.includes(key)).length > 1)) return true;
        if (Object.values(CONFLICTING_FINGER_GROUPS_TRIPLE).some((fingerKeys) => fingerKeys.filter((key) => chord.includes(key)).length > 2)) return true;
        if (Object.values(UNUSABLE_CHORDS).some((fingerKeys) => JSON.stringify([...fingerKeys].sort()) === JSON.stringify(sortedChord))) return true;

        return false;
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

        for (const [, chords] of this.uploadedChords.entries()) {
            for (const uploadedChord of chords) {
                const sortedUploadedChord = [...uploadedChord].sort();
                if (JSON.stringify(sortedUploadedChord) === JSON.stringify(sortedChord)) {
                    return true;
                }
            }
        }
        return false;
    }

    mirrorKeys(chord) {
        return chord.map(char => KEY_MIRROR_MAP_L[char] || KEY_MIRROR_MAP_R[char]).filter(Boolean);
    }

    threeDKeys(chord) {
        return chord.map(char => this.getThreeDKey(char)).filter(Boolean);
    }

    getThreeDKey(char) {
        for (const [finger, chars] of Object.entries(KEY_FINGER_MAP)) {
            if (chars.includes(char)) return `${finger}_3D`;
        }
        return null;
    }
}