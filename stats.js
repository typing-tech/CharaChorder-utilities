document.getElementById("calculateStats").addEventListener("click", function () {
    // Get the input file
    var inputFile = document.getElementById("input-file").files[0];

    var reader = new FileReader();
    reader.onload = function () {
        var csvString = reader.result;
        var rows = csvString.split("\n");

        // Initialize an object to store the counts of values with different lengths
        var lengthCounts = {};
        var valueCounts = {};
        var wordCounts = {};
        // Calculate the counts of values with different lengths
        rows.forEach(function (row) {
            var cells = row.split(",");
            var value = cells[0];
            value = value.replace(/[\s+]+/g, ' ');
            var valueLength = value.split(' ').length;
            if (!lengthCounts[valueLength]) {
                lengthCounts[valueLength] = 1;
            }
            else {
                lengthCounts[valueLength]++;
            }
            // Increment the count for the value in the second column
            var secondColumnValue = cells[1];
            if (!valueCounts[secondColumnValue]) {
                valueCounts[secondColumnValue] = 1;
            }
            else {
                valueCounts[secondColumnValue]++;
            }

            var words = value.split(' ');
            words.forEach(function (word) {
                if (!wordCounts[word]) {
                    wordCounts[word] = 1;
                }
                else {
                    wordCounts[word]++;
                }
            })
        });

        var summaryTable = "<table><tr><th>Chord Lengths</th><th>Count</th></tr>";
        for (var length in lengthCounts) {
            summaryTable += "<tr><td>" + length + " key chord" + "</td><td>" + lengthCounts[length] + "</td></tr>";
        }
        summaryTable += "</table>";

        // Calculate frequencies of letters/keys used
        var sortedWordCounts = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
        var wordFrequencyTable = "<table><tr><th>Letter/Key</th><th>Count</th></tr>";
        
        // Use an object to store words with the same count
        var countToWords = {};
        
        for (var i = 0; i < sortedWordCounts.length; i++) {
            var currentCount = sortedWordCounts[i][1];
            var currentWord = sortedWordCounts[i][0];
        
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
        
        
        var uniqueValuesCount = Object.keys(valueCounts).length;
        document.getElementById("stats").innerHTML = "Number of chords: " + rows.length + "<br>Number of unique words chorded: " + uniqueValuesCount + "<br>" + summaryTable + "<br>" + wordFrequencyTable;
    };

    reader.readAsText(inputFile);
});