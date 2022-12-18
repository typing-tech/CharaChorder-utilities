document.getElementById("calculateStats").addEventListener("click", function () {
    // Get the input file
    var inputFile = document.getElementById("input-file").files[0];

    var reader = new FileReader();
    reader.onload = function () {
        var csvString = reader.result;
        var rows = csvString.split("\n");

        // Initialize an object to store the counts of chordMaps with different lengths
        var lengthCounts = {};
        var chordMapCounts = {};
        var lettersCounts = {};
        var dupWords = [];
        var wordGroups = {};
        
        // Calculate the counts of chordMaps with different lengths
        rows.forEach(function (row) {
            var cells = row.split(",");
            var chordMap = cells[0];
            chordMap = chordMap.replace(/[\s+]+/g, ' ');// Get rid of extra spaces and +
            var chordMapLength = chordMap.split(' ').length;
            if (!lengthCounts[chordMapLength]) {
                lengthCounts[chordMapLength] = 1;
            }
            else {
                lengthCounts[chordMapLength]++;
            }
            // Increment the count for the chordMap in the second column
            var chord = cells[1];
            if (!chordMapCounts[chord]) {
                chordMapCounts[chord] = 1;
            }
            else {
                chordMapCounts[chord]++;
                dupWords.push(chord)
            }

            var letters = chordMap.split(' ');
            letters.forEach(function (letter) {
                if (!lettersCounts[letter]) {
                    lettersCounts[letter] = 1;
                }
                else {
                    lettersCounts[letter]++;
                }
            })
        });

        var summaryTable = "<table><tr><th>Chord Lengths</th><th>Count</th></tr>";
        for (var length in lengthCounts) {
            summaryTable += "<tr><td>" + length + " key chord" + "</td><td>" + lengthCounts[length] + "</td></tr>";
        }
        summaryTable += "</table>";

        // Calculate frequencies of letters/keys used
        var sortedLettersCounts = Object.entries(lettersCounts).sort((a, b) => b[1] - a[1]);
        var wordFrequencyTable = "<table><tr><th>Letter/Key</th><th>Count</th></tr>";
        
        // Use an object to store words with the same count
        var countToWords = {};
        
        for (var i = 0; i < sortedLettersCounts.length; i++) {
            var currentCount = sortedLettersCounts[i][1];
            var currentWord = sortedLettersCounts[i][0];
        
            // If this count is not in the object yet, add it
            if (!(currentCount in countToWords)) {
                countToWords[currentCount] = [];
            }
        
            // Add the current word to the array for this count
            countToWords[currentCount].push(currentWord);
        }
        
        // Get an array of the counts in ascending order
        var counts = Object.keys(countToWords).sort((a, b) => a - b);
        
        // Sort the counts in descending order
        counts.sort((a, b) => b - a);
        
        // Iterate through the object and add the words and counts to the table
        for (var i = 0; i < counts.length; i++) {
            var count = counts[i];
            var words = countToWords[count].join(", ");
            var currentRow = "<tr><td>" + words + "</td><td>" + count + "</td></tr>";
            wordFrequencyTable += currentRow;
        }
        
        wordFrequencyTable += "</table>";
        
        
        var uniquechordMapsCount = Object.keys(chordMapCounts).length;
        document.getElementById("stats").innerHTML = "Number of chords: " + rows.length + "<br>Number of unique words chorded: "  + uniquechordMapsCount + 
        "<br>Duplicate words: "+dupWords.join(', ') + "<br><br>" + summaryTable + "<br>" + wordFrequencyTable;
    };

    reader.readAsText(inputFile);
});