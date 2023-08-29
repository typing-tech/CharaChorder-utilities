

export function calculateBigrams(text) {
    var words = text.split(' ');
    var wordCount = words.length;

    // Use the filter method and the indexOf method to remove any duplicates
    var uniqueWords = words.filter(function (word, index) {
        return words.indexOf(word) === index;
    });

    // Create a list of bigrams by iterating over each word in the array
    var bigrams = [];
    for (var i = 0; i < words.length; i++) {
        // Remove any leading or trailing spaces from the word
        var word = words[i].trim();

        // Skip over any empty words (which can happen if the text has multiple consecutive spaces)
        if (word.length >= 2) {
            // Check for line breaks in the word
            if (word.indexOf('\n') === -1) {
                for (var j = 0; j < word.length - 1; j++) {
                    var lowered = word.toLowerCase()
                    var bigram = lowered.substring(j, j + 2);
                    const [letter1, letter2] = bigram.split('');
                    if (!/^[a-z]$/.test(letter1) || !/^[a-z]$/.test(letter2)) {
                        // If either letter is not a lowercase letter, skip this iteration
                        continue;
                    }
                    // sort the characters in the bigram so that permutations are counted together
                    bigram = bigram.split('').sort().join('');
                    var reversedbigram = bigram.split('').reverse().join('');
                    bigram = bigram + " | " + reversedbigram;
                    bigrams.push(bigram);
                }
            }
        }
    }

    // create an object to hold the frequency of each bigram
    var bigramCounts = {};
    for (let i = 0; i < bigrams.length; i++) {
        let bigram = bigrams[i];
        if (bigram in bigramCounts) {
            bigramCounts[bigram]++;
        } else {
            bigramCounts[bigram] = 1;
        }
    }

    return [bigramCounts, wordCount, uniqueWords.length];
}

export function createFrequencyTable(bigramCounts) {
    // Create a matrix of zeroes with 26 rows and 26 columns
    // (assuming you only have lowercase letters in your input)
    const matrix = Array(26)
        .fill()
        .map(() => Array(26).fill(0));

    const normalizedMatrix = Array(26)
        .fill()
        .map(() => Array(26).fill(0));

    // Loop through each key-value pair in the input object
    for (const [key, value] of Object.entries(bigramCounts)) {
        // Split the key into two letters
        const [letter1, letter2] = key.split(" ")[0].split("");

        // Check if either letter1 or letter2 is not a lowercase letter
        if (!/^[a-z]$/.test(letter1) || !/^[a-z]$/.test(letter2)) {
            // If either letter is not a lowercase letter, skip this iteration
            continue;
        }

        // Convert the letters to their ASCII codes (a = 97, b = 98, etc.)
        const ascii1 = letter1.charCodeAt(0) - 97;
        const ascii2 = letter2.charCodeAt(0) - 97;

        matrix[ascii1][ascii2] = value;
        matrix[ascii2][ascii1] = value;

        // Normalize the value to be in the range 0-255
        const normalizedValue = (value / Math.max(...Object.values(bigramCounts))) * 255

        // Update the matrix with the value from the input object
        normalizedMatrix[ascii1][ascii2] = normalizedValue;
        normalizedMatrix[ascii2][ascii1] = normalizedValue; // (assuming you want the matrix to be symmetrical)
    }
    return [matrix, normalizedMatrix]
}

async function calcStats(text, chords, minReps, lemmatizeChecked) {
    const counts = await findUniqueWords(chords, text, lemmatizeChecked);
    return [counts.sortedWords, counts.uniqueWordCount, counts.chordWordCount];
}

export function findMissingChords(textToAnalyze, chordLibrary) {
    const chords = new Set();
    chordLibrary.forEach(({ chordOutput }) => chordOutput && chords.add(chordOutput));
    return calcStats(textToAnalyze, chords, 5, false);
}

async function processWords(words, lemmatize) {
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase().replace(/[^\w\s]/g, '');
        if (lemmatize) {
            // const doc = nlp(words[i])
            // doc.verbs().toInfinitive()
            // doc.nouns().toSingular()
            // const lemma = doc.out('text')
            // words[i] = lemma;
        }
    }
    return words;
}

async function findUniqueWords(chords, text, lemmatize) {
    // Split the text into an array of words
    var words = text.split(/\s+/);
    words = await processWords(words, lemmatize);

    var wordCounts = {};
    var uniqueWordCount = 0;
    var chordWordCount = 0;
    var countedChords = {};

    // Count the number of times each word appears in the text
    for (var i = 0; i < words.length; i++) {
        var word = words[i].trim();
        if (word === "") {
            continue;
        }
        if (word.length > 1) {
            if (!(word in wordCounts)) {
                wordCounts[word] = 1;
                uniqueWordCount++;
            } else {
                wordCounts[word]++;
            }
        }
    }

    // Create a dictionary of words that do not appear in the chords set
    var sortedWords = {};
    for (let i = 0; i < words.length; i++) {
        let word = words[i].trim();
        if (word === "") {
            continue;
        }
        if (word.length > 1) {
            if (!chords.has(word)) {
                if (!(word in sortedWords)) {
                    sortedWords[word] = 1;
                } else {
                    sortedWords[word]++;
                }
            } else {
                if (!(word in countedChords)) {
                    countedChords[word] = true;
                    chordWordCount++;
                }
            }
        }
    }

    var descSortedWords = Object.entries(sortedWords).sort((a, b) => b[1]*b[0].length - a[1]*a[0].length);
    return {
        sortedWords: descSortedWords,
        uniqueWordCount: uniqueWordCount,
        chordWordCount: chordWordCount
    };
}

export function getPhraseFrequency(text, phraseLength, minRepetitions, chordLibrary) {
    const chords = new Set();
    chordLibrary.forEach(({ chordOutput }) => chordOutput && chords.add(chordOutput));

    // Replace all new line and tab characters with a space character, and remove consecutive spaces
    const textWithSpaces = text.replace(/[\n\t]/g, ' ').replace(/\s+/g, ' ');

    // Split the text into an array of words
    const origWords = textWithSpaces.split(' ').map(word => word.replace(/[^\w\s]/g, ''));
    const words = origWords
        // Remove empty strings from the array
        .filter(word => word.trim().length > 0)
        // Convert all words to lower case
        .map(word => word.toLowerCase());


    // Create a dictionary to store the phrases and their frequency
    const phraseFrequency = {};

    // Iterate over the words array and add each phrase to the dictionary
    for (let i = 0; i < words.length; i++) {
        for (let j = 2; j <= phraseLength; j++) {
            // Get the current phrase by joining the next `j` words with a space character
            const phrase = words.slice(i, i + j).join(' ');
            // Check if the phrase fits within the bounds of the `words` array
            if (i + j <= words.length) {
                // Split the phrase into a list of words
                const phraseWords = phrase.split(' ');
                // Check if the phrase contains at least two words
                if (phraseWords.length >= 2) {
                    // If the phrase is already in the dictionary, increment its frequency. Otherwise, add it to the dictionary with a frequency of 1.
                    if (phrase in phraseFrequency) {
                        phraseFrequency[phrase]++;
                    } else {
                        phraseFrequency[phrase] = 1;
                    }
                }
            }
        }
    }

    // Filter the sorted phrase frequency dictionary by the minimum number of repetitions
    const filteredPhraseFrequency = {};
    Object.keys(phraseFrequency).forEach(phrase => {
        if (phraseFrequency[phrase] >= minRepetitions) {
            filteredPhraseFrequency[phrase] = phraseFrequency[phrase];
        }
    });

    // Remove entries from the filtered phrase frequency object that are already in the chords set
    const lowerCaseChords = new Set(Array.from(chords).map(phrase => phrase.trim().toLowerCase()));
    const filteredPhraseFrequencyWithoutChords = Object.keys(filteredPhraseFrequency)
        .filter(phrase => !lowerCaseChords.has(phrase))
        .reduce((obj, phrase) => {
            obj[phrase] = filteredPhraseFrequency[phrase];
            return obj;
        }, {});
    
    let sortableArray = Object.entries(filteredPhraseFrequencyWithoutChords);
    sortableArray.sort((a, b) => {
        const scoreA = a[0].length * a[1];
        const scoreB = b[0].length * b[1];
        return scoreB - scoreA;
    });

    return sortableArray;
}