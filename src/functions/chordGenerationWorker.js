function generateChords(words, sliderValue, checkboxStates, chordLibrary) {
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

    const UNUSABLE_CHORDS = {
        "impulse_chord": ['DUP', 'i']
    };

    const settings = {
        useDupKey: checkboxStates.useDupKey,
        useMirroredKeys: checkboxStates.useMirroredKeys,
        useAltKeys: checkboxStates.useAltKeys,
        use3dKeys: checkboxStates.use3dKeys,
        sliderValue: sliderValue,
        chordLibrary: chordLibrary
    };

    const onlyChars = true;
    const useDupKey = settings.useDupKey;
    const useMirroredKeys = settings.useMirroredKeys;
    const useAltKeys = settings.useAltKeys;
    const use3dKeys = settings.use3dKeys;
    const minChordLength = settings.sliderValue[0];
    const maxChordLength = settings.sliderValue[1];
    let usedChords = {};
    let uploadedChords = new Map();
    let localWords = [...new Set(words.map(word => word.toLowerCase()))];

    const CHORD_GENERATORS_MAP = {
        'onlyCharsGenerator': onlyCharsGenerator,
        'useMirroredKeysGenerator': useMirroredKeysGenerator,
        'useAltKeysGenerator': useAltKeysGenerator,
        'use3dKeysGenerator': use3dKeysGenerator
    };

    const SETTINGS_MAP = {
        'onlyChars': onlyChars,
        'useMirroredKeys': useMirroredKeys,
        'useAltKeys': useAltKeys,
        'use3dKeys': use3dKeys
    };

    function wordsList() {
        return localWords.filter(word => word.length >= MIN_WORD_LENGTH);
    }

    function loadUploadedChords() {
        return new Promise((resolve, reject) => {
            try {
                if (!chordLibrary || !Array.isArray(chordLibrary)) {
                    console.warn('chordLibrary is not properly initialized.');
                    resolve();
                    return;
                }

                chordLibrary.forEach((entry) => {
                    if (entry.chordInput && entry.chordOutput) {
                        const chord = entry.chordInput.trim().split(' + ');
                        const word = entry.chordOutput.trim();

                        if (uploadedChords.has(word)) {
                            uploadedChords.get(word).push(chord);
                        } else {
                            uploadedChords.set(word, [chord]);
                        }
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    function calculateChord(chars) {
        for (const generatorKey of Object.keys(CHORD_GENERATORS_MAP)) {
            const option = generatorKey.replace('Generator', '');
            if (SETTINGS_MAP[option]) {
                const chord = CHORD_GENERATORS_MAP[generatorKey](chars); // function call here
                if (chord) {
                    const reversedChord = chord.slice().sort().reverse(); // Ensuring slice() so as not to mutate the original array
                    return reversedChord;
                }
            }
        }
        return null;
    }

    function getChars(word) {
        const chars = word.split("").filter(str => str !== " ");
        let uniq_chars = [...new Set(chars)];
        if (uniq_chars.length < chars.length && useDupKey) {
            uniq_chars = [...new Set(chars), "DUP"]
        }
        const validChars = Object.values(KEY_FINGER_MAP).flat();

        return uniq_chars.filter(char => validChars.includes(char));
    }

    function assignChord(word, chord) {
        usedChords[word] = chord;
    }

    function onlyCharsGenerator(chars) {
        for (const chord of allCombinations(chars)) {
            if (validChord(chord)) return chord;
        }
    }

    function useMirroredKeysGenerator(chars) {
        for (const chord of allCombinations([...new Set([...chars, ...mirrorKeys(chars)])])) {
            if (validChord(chord)) return chord;
        }
    }

    function use3dKeysGenerator(chars) {
        for (const chord of allCombinations([...new Set([...chars, ...threeDKeys(chars)])])) {
            if (validChord(chord)) return chord;
        }
    }

    function useAltKeysGenerator(chars) {
        for (const chord of allCombinations([...new Set([...chars, ...ALT_KEYS])])) {
            if (validChord(chord)) return chord;
        }
    }

    function validChord(chord) {
        return !fingerConflict(chord) && !usedChord(chord) && !uploadedChord(chord);
    }

    const powerSetCache = {};

    function powerSet(chars) {
        const cacheKey = chars.join(',');
        if (powerSetCache[cacheKey]) return powerSetCache[cacheKey];

        const result = [[]];
        for (const value of chars) {
            const length = result.length;
            for (let i = 0; i < length; i++) {
                const subset = result[i];
                result.push(subset.concat(value));
            }
        }
        powerSetCache[cacheKey] = result;
        return result;
    }

    function allCombinations(chars) {
        return powerSet(chars)
            .filter(subset => subset.length >= minChordLength && subset.length <= maxChordLength)
            .sort((a, b) => a.length - b.length);
    }

    function fingerConflict(chord) {
        const sortedChord = [...chord].sort();
        if (hasDuplicates(chord)) return true;
        if (Object.values(CONFLICTING_FINGER_GROUPS_DOUBLE).some((fingerKeys) => fingerKeys.filter((key) => chord.includes(key)).length > 1)) return true;
        if (Object.values(CONFLICTING_FINGER_GROUPS_TRIPLE).some((fingerKeys) => fingerKeys.filter((key) => chord.includes(key)).length > 2)) return true;
        if (Object.values(UNUSABLE_CHORDS).some((fingerKeys) => JSON.stringify([...fingerKeys].sort()) === JSON.stringify(sortedChord))) return true;

        return false;
    }

    function hasDuplicates(chord) {
        return chord.length > new Set(chord).size;
    }

    function usedChord(chord) {
        const sortedChord = [...chord].sort();
        return Object.values(usedChords).some(usedChord => {
            const sortedUsedChord = [...usedChord].sort();
            return JSON.stringify(sortedUsedChord) === JSON.stringify(sortedChord);
        });
    }

    function uploadedChord(chord) {
        const sortedChord = [...chord].sort();

        for (const [, chords] of uploadedChords.entries()) {
            for (const uploadedChord of chords) {
                const sortedUploadedChord = [...uploadedChord].sort();
                if (JSON.stringify(sortedUploadedChord) === JSON.stringify(sortedChord)) {
                    return true;
                }
            }
        }
        return false;
    }

    function mirrorKeys(chord) {
        return chord.map(char => KEY_MIRROR_MAP_L[char] || KEY_MIRROR_MAP_R[char]).filter(Boolean);
    }

    function threeDKeys(chord) {
        return chord.map(char => getThreeDKey(char)).filter(Boolean);
    }

    function getThreeDKey(char) {
        for (const [finger, chars] of Object.entries(KEY_FINGER_MAP)) {
            if (chars.includes(char)) return `${finger}_3D`;
        }
        return null;
    }

    function generate() {
        loadUploadedChords();
        const totalWords = wordsList().length;

        let currentIteration = 0
        let skippedWords = 0
        const failedWords = [];

        for (let index = 0; index < totalWords; index++) {
            const word = wordsList()[index];
            // Skip if the word is already in chordLibrary
            if (uploadedChords.has(word)) {
                //console.log(`Skipping '${word}' because it already in chordLibrary.`);
                skippedWords++;
                continue;
            }

            const chord = calculateChord(getChars(word));
            if (chord) {
                assignChord(word, chord.sort().reverse());
            } else {
                //console.log("Could not generate chord for", word);
                failedWords.push(word);
            }

            currentIteration++;

            const progress = (currentIteration / totalWords) * 100;
            postMessage({ type: 'progress', progress });
        }
        return {
            usedChords: usedChords,
            skippedWordCount: skippedWords,
            failedWords: failedWords
        };
    }

    let results = generate();
    return results;
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
    if (e.data.type === 'generateChords') {
        postMessage({ type: 'progress', progress: 0 });  // Initial progress message
        const result = generateChords(e.data.wordsArray, e.data.sliderValue, e.data.checkboxStates, e.data.chordLibrary);
        postMessage({ type: 'result', result });  // Final result
    }
}
