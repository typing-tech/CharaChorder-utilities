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

        var summaryTable = "<table id='chordLengths'><tr><th>Chord Lengths</th><th>Count</th></tr>";
        for (var length in lengthCounts) {
            summaryTable += "<tr><td>" + length + " key chord" + "</td><td>" + lengthCounts[length] + "</td></tr>";
        }
        summaryTable += "</table>";

        // Calculate frequencies of letters/keys used
        var sortedLettersCounts = Object.entries(lettersCounts).sort((a, b) => b[1] - a[1]);
        var wordFrequencyTable = "<table id='letterCounts'><tr><th>Letter/Key</th><th>Count</th></tr>";

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
        document.getElementById("stats").innerHTML = "<button id='downloadBanner' type='button' style='margin-top:5px'>Download Discord banner</button><h3>Statistics</h3>" + "Number of chords: " + rows.length + "<br>Number of unique words chorded: " + uniquechordMapsCount +
            "<br>" + summaryTable + "<br>" + wordFrequencyTable + "<br>Duplicate words: " + dupWords.join(', ');
        addCSVButton("letterCounts", "Letter Counts");
        addCSVButton("chordLengths", "Chord Lengths");
        document.getElementById("downloadBanner").addEventListener("click", function () {
            var bannerContent = generateBannerContent(rows.length, uniquechordMapsCount, lengthCounts);
            bannerContent.toBlob(function (blob) {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]);
            })
            toastr.success('Banner copied to clipboard');
        });
    };

    reader.readAsText(inputFile);
});

function generateBannerContent(numChords, numUniqueChords, lengthCounts) {
    xAxis = [];
    counts = [];
    for (var length in lengthCounts) {
        xAxis.push(length);
        counts.push(lengthCounts[length]);
    }

    // Set the canvas size
    var canvas = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 125;

    // Get the canvas context
    var ctx = canvas.getContext("2d");

    // Set the font and text baseline
    ctx.font = "16px Georgia";
    ctx.textBaseline = "top";

    // To change the color on the rectangle, just manipulate the context
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.beginPath();
    ctx.roundRect(3, 3, canvas.width - 5, canvas.height - 5, 10);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    // Set the fill color to white
    ctx.fillStyle = "#FFFFFF";

    // Draw the text on the canvas
    ctx.fillText("Number of chords: " + numChords, 10, 10);
    ctx.fillText("Number of unique words: " + numUniqueChords, 10, 30);

    // Set the font for the label text
    ctx.font = "12px Georgia";

    // Measure the label text
    var labelText = "Generated with CharaChorder-utilities";
    var labelWidth = ctx.measureText(labelText).width;

    ctx.fillStyle = "#666";

    // Draw the label text at the bottom right corner of the canvas
    ctx.fillText(labelText, canvas.width - labelWidth - 10, canvas.height - 20);

    // Set the chart area width and height
    const chartWidth = 125;
    const chartHeight = 25;
    const labelHeight = 10; // height of the label area below the chart
    const columnSpacing = 2; // space between columns

    // Calculate the maximum count value
    const maxCount = Math.max(...counts);

    // Calculate the column width based on the number of columns and column spacing
    const columnWidth = (chartWidth - (counts.length - 1) * columnSpacing) / counts.length;

    // Set the starting x and y positions for the columns
    let xPos = 100;
    let yPos = canvas.height-50;

    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Chord length", 5, yPos + labelHeight / 2);
    ctx.textAlign = "center";
    // Iterate through the counts and draw the columns
    for (let i = 0; i < counts.length; i++) {
        // Calculate the column height based on the count value and the maximum count
        const columnHeight = (counts[i] / maxCount) * chartHeight;

        // Draw the column
        ctx.fillRect(xPos, yPos - columnHeight, columnWidth, columnHeight);

        // Draw the label below the column
        ctx.fillText(xAxis[i], xPos + columnWidth / 2, yPos + labelHeight / 2);

        // Increment the x position for the next column
        xPos += columnWidth;
    }

    return canvas;
}

toastr.options = {
    "closeButton": true,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}