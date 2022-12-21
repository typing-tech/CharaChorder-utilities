/**
* Calculate statistics on the given chords and text, and display the results in the HTML page.
*
* @param {Array} chords - An array of chords, where each chord is a string.
* @param {boolean} csvPresent - A boolean indicating whether the chords are present in the text.
* @return {void} None. The function updates the innerHTML of the "results" and "phrases" elements in the HTML page.
*/
async function calcStats(chords, csvPresent) {
    // Get the text from the textarea
    var text = document.getElementById("textarea").value;
    var counts = await findUniqueWords(chords, text, document.getElementById('lemmatization').checked);
    var sortedWords = counts.sortedWords;
    var uniqueWordCount = counts.uniqueWordCount;
    var chordWordCount = counts.chordWordCount;
    const minRepsInput = document.getElementById('minReps');
    const minReps = minRepsInput.value;

    // Build up the table in memory as a string
    var tableString = '<table id="wordTable"><thead><tr><th>Word</th><th>Frequency</th></tr></thead><tbody>';
    for (var i = 0; i < sortedWords.length; i++) {
        if (sortedWords[i][1] >= minReps && sortedWords[i][0] != '') {
            tableString += `<tr><td>${sortedWords[i][0]}</td><td>${sortedWords[i][1]}</td></tr>`;
        }
    }
    tableString += '</tbody></table>';

    // Get the element with id "results" and update its innerHTML
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = '<a href="#phrases">Jump to Phrases Section</a></br>';
    if (csvPresent) {
        resultsDiv.innerHTML += `You have chords for ${chordWordCount} of the ${uniqueWordCount} unique words in the text (case insensitive). That is ${Math.round(chordWordCount / uniqueWordCount * 100)}%!`
    }
    else {
        resultsDiv.innerHTML += `There are ${uniqueWordCount} unique words in the text (case insensitive).`;
    }
    resultsDiv.innerHTML += tableString;
    addCSVButton("wordTable", "Word Frequency");


    var commonPhrases = getPhraseFrequency(text, 6, minReps, chords)

    // Build up the table in memory as a string
    var tableString = '<table id="phraseTable"><thead><tr><th>Phrase</th><th>Frequency</th></tr></thead><tbody>';
    Object.keys(commonPhrases).forEach(phrase => {
        tableString += `<tr><td>${phrase}</td><td>${commonPhrases[phrase]}</td></tr>`;
    });
    tableString += '</tbody></table>';

    // Get the element with id "phrases" and update its innerHTML
    const phrasesDiv = document.getElementById('phrases');
    phrasesDiv.innerHTML = '<a href="#results">Jump to Word Section</a></br>' + tableString;
    addCSVButton("phraseTable", "Phrase Frequency");
}

/**
* Find missing chords in the text by reading them from an input CSV file.
*
* @param {void}
* @return {void} None. The function calls the `calcStats` function with the chords read from the input file, or with an empty set if the input file is not defined.
*/
function findMissingChords() {

    var inputFile = document.getElementById("input-file").files[0];

    // check if inputFile is defined
    if (inputFile) {
        var reader = new FileReader();
        reader.onload = function () {
            var csvString = reader.result;
            var rows = csvString.split("\n");

            var chords = new Set();
            for (var i = 0; i < rows.length; i++) {
                var chord = rows[i].split(",")[1];
                chords.add(chord);
            }
            calcStats(chords, true);
        };
        reader.readAsText(inputFile);
    } else {
        // inputFile is not defined, so call calcStats with an empty set
        calcStats(new Set(), false);
    }
}

/**
* Process a list of words by lowercasing and removing punctuation, and optionally lemmatizing them.
*
* @param {Array} words - An array of strings representing the words to be processed.
* @param {boolean} lemmatize - A boolean indicating whether to lemmatize the words.
* @return {Array} An array of strings representing the processed words.
*/

async function processWords(words, lemmatize) {
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase().replace(/[^\w\s]/g, '');
        if (lemmatize) {
            const doc = nlp(words[i])
            doc.verbs().toInfinitive()
            doc.nouns().toSingular()
            const lemma = doc.out('text')
            words[i] = lemma;
        }
    }
    return words;
}

/**
* Find the unique words in a given text and count their frequencies, filtering out words that appear in the given chords set.
* Optionally lemmatize the words.
*
* @param {Set} chords - A set of chords, where each chord is a string.
* @param {string} text - The input text to search for unique words.
* @param {boolean} lemmatize - A boolean indicating whether to lemmatize the words.
* @return {Object} An object with the following properties:
*                  - sortedWords: An array of arrays, where each inner array represents a unique word and its frequency, sorted in descending order by frequency.
*                  - uniqueWordCount: The total number of unique words in the text.
*                  - chordWordCount: The number of unique words in the text that also appear in the chords set.
*/
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
    for (var i = 0; i < words.length; i++) {
        var word = words[i].trim();
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

    // Sort the dictionary by frequency
    var descSortedWords = Object.entries(sortedWords).sort((a, b) => b[1] - a[1]);
    return {
        sortedWords: descSortedWords,
        uniqueWordCount: uniqueWordCount,
        chordWordCount: chordWordCount
    };
}

/**
* Find the frequency of phrases in a given text, with a specified maximum length and minimum number of repetitions, and filter out phrases that appear in the given chords set.
*
* @param {string} text - The input text to search for phrases.
* @param {number} phraseLength - The maximum length of a phrase, in number of words.
* @param {number} minRepetitions - The minimum number of repetitions for a phrase to be included in the results.
* @param {Set} chords - A set of chords, where each chord is a string.
* @return {Object} A dictionary of phrases and their frequency, sorted in descending order by frequency and filtered by the minimum number of repetitions and the presence in the chords set.
*/
function getPhraseFrequency(text, phraseLength, minRepetitions, chords) {
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

    // Sort the phrase frequency dictionary in descending order
    const sortedPhraseFrequency = {};
    Object.keys(phraseFrequency).sort((a, b) => phraseFrequency[b] - phraseFrequency[a]).forEach(phrase => {
        sortedPhraseFrequency[phrase] = phraseFrequency[phrase];
    });

    // Filter the sorted phrase frequency dictionary by the minimum number of repetitions
    const filteredPhraseFrequency = {};
    Object.keys(sortedPhraseFrequency).forEach(phrase => {
        if (sortedPhraseFrequency[phrase] >= minRepetitions) {
            filteredPhraseFrequency[phrase] = sortedPhraseFrequency[phrase];
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

    return filteredPhraseFrequencyWithoutChords;
}