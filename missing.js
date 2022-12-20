function calcStats(chords, csvPresent) {
    // Get the text from the textarea
    var text = document.getElementById("textarea").value;
    var counts = findUniqueWords(chords, text, document.getElementById('lemmatization').checked);
    var sortedWords = counts.sortedWords;
    var uniqueWordCount = counts.uniqueWordCount;
    var chordWordCount = counts.chordWordCount;
    const minRepsInput = document.getElementById('minReps');
    const minReps = minRepsInput.value;

    var table = document.createElement("table");
    var head = document.createElement("thead");
    var body = document.createElement("tbody");
    table.appendChild(head);
    table.appendChild(body);
    var headingRow = document.createElement("tr");
    var wordHeading = document.createElement("th");
    wordHeading.textContent = "Word";
    var frequencyHeading = document.createElement("th");
    frequencyHeading.textContent = "Frequency";
    headingRow.appendChild(wordHeading);
    headingRow.appendChild(frequencyHeading);
    head.appendChild(headingRow);
    for (var i = 0; i < sortedWords.length; i++) {
        if (sortedWords[i][1] >= minReps && sortedWords[i][0] != '') {
            var wordRow = document.createElement("tr");
            var wordCell = document.createElement("td");
            wordCell.textContent = sortedWords[i][0];
            var frequencyCell = document.createElement("td");
            frequencyCell.textContent = sortedWords[i][1];
            wordRow.appendChild(wordCell);
            wordRow.appendChild(frequencyCell);
            body.appendChild(wordRow);
        }
    }
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = '<a href="#phrases">Jump to Phrases Section</a></br>';
    if (csvPresent) {
        resultsDiv.innerHTML += `You have chords for ${chordWordCount} of the ${uniqueWordCount} unique words in the text (case insensitive). That is ${Math.round(chordWordCount / uniqueWordCount * 100)}%!`
    }
    else {
        resultsDiv.innerHTML += `There are ${uniqueWordCount} unique words in the text (case insensitive).`;
    }
    table.id = "wordTable";
    resultsDiv.appendChild(table);
    addCSVButton("wordTable", "Word Frequency");


    var commonPhrases = getPhraseFrequency(text, 6, minReps, chords)
    // Get the element with id "phrases"
    const phrasesDiv = document.getElementById('phrases');

    // Create a new table element
    const table2 = document.createElement('table');

    // Create a new row element for the header
    const headerRow = document.createElement('tr');

    // Create table header elements for the phrase and count columns
    const phraseHeader = document.createElement('th');
    phraseHeader.textContent = 'Phrase';

    const countHeader = document.createElement('th');
    countHeader.textContent = 'Frequency';

    // Append the table header elements to the header row
    headerRow.appendChild(phraseHeader);
    headerRow.appendChild(countHeader);

    // Append the header row to the table
    table2.appendChild(headerRow);

    // Iterate over the common phrases and add a row for each phrase
    Object.keys(commonPhrases).forEach(phrase => {
        // Create a new row element
        const row = document.createElement('tr');

        // Create a new cell element for the phrase
        const phraseCell = document.createElement('td');
        phraseCell.textContent = phrase;

        // Create a new cell element for the frequency
        const frequencyCell = document.createElement('td');
        frequencyCell.textContent = commonPhrases[phrase];

        // Append the cells to the row
        row.appendChild(phraseCell);
        row.appendChild(frequencyCell);

        // Append the row to the table
        table2.appendChild(row);
    });

    // Clear the contents of the phrases div
    phrasesDiv.innerHTML = '<a href="#results">Jump to Word Section</a></br>';

    // Append the table to the phrases div

    table2.id = "phraseTable";
    phrasesDiv.appendChild(table2);
    addCSVButton("phraseTable", "Phrase Frequency");
}

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

function findUniqueWords(chords, text, lemmatize) {
    // Split the text into an array of words
    var words = text.split(/\s+/);
    words = words.filter(function (word) {
        return word !== '';
    });
    words.forEach(function (word, index) {
        words[index] = word.toLowerCase().replace(/[^\w\s]/g, '');
        if (lemmatize) {
            var doc = nlp(words[index])
            doc.verbs().toInfinitive()
            doc.nouns().toSingular()
            const lemma = doc.out('text')
            words[index] = lemma;
        }
    });
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