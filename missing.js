function findMissingChords() {
    var inputFile = document.getElementById("input-file").files[0];

    var reader = new FileReader();
    reader.onload = function () {
        var csvString = reader.result;
        var rows = csvString.split("\n");

        var chords = new Set();
        for (var i = 0; i < rows.length; i++) {
            var chord = rows[i].split(",")[1];
            chords.add(chord);
        }

        // Get the text from the textarea
        var text = document.getElementById("textarea").value;

        var sortedWords = findUniqueWords(chords, text);

        var counts = findUniqueWords(chords, text);
        var sortedWords = counts.sortedWords;
        var uniqueWordCount = counts.uniqueWordCount;
        var chordWordCount = counts.chordWordCount;

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
            var wordRow = document.createElement("tr");
            var wordCell = document.createElement("td");
            wordCell.textContent = sortedWords[i][0];
            var frequencyCell = document.createElement("td");
            frequencyCell.textContent = sortedWords[i][1];
            wordRow.appendChild(wordCell);
            wordRow.appendChild(frequencyCell);
            body.appendChild(wordRow);
        }
        var resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `You have chords for ${chordWordCount} of the ${uniqueWordCount} unique words in the text (case insensitive). That is ${Math.round(chordWordCount/uniqueWordCount*100)}%!`
        resultsDiv.appendChild(table);
    };
    reader.readAsText(inputFile);
}

function findUniqueWords(chords, text) {
    // Split the text into an array of words
    var words = text.split(/\s+/);
    words = words.filter(function (word) {
        return word !== '';
    });
    words.forEach(function (word, index) {
        words[index] = word.toLowerCase().replace(/[^\w\s]/g, '');
    });
    
    var wordCounts = {};
    var uniqueWordCount = 0;
    var chordWordCount = 0;
    var countedChords = {};

    console.log(words)
    // Count the number of times each word appears in the text
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (!(word in wordCounts)) {
            wordCounts[word] = 1;
            uniqueWordCount++;
        } else {
            wordCounts[word]++;
        }
    }

    // Create a dictionary of words that do not appear in the chords set
    var sortedWords = {};
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
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

    // Sort the dictionary by frequency
    var descSortedWords = Object.entries(sortedWords).sort((a, b) => b[1] - a[1]);
    return {
        sortedWords: descSortedWords,
        uniqueWordCount: uniqueWordCount,
        chordWordCount: chordWordCount
    };
}