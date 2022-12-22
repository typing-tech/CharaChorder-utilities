var sortOrder = 'ascending';
function sortTable(tableId, colIndex) {
    var table = document.getElementById(tableId);
    var rows = table.getElementsByTagName("tr");
    // Store the rows in an array, then sort the array based on the values in the specified column
    var rowArray = [];
    for (var i = 0; i < rows.length; i++) {
        rowArray.push(rows[i]);
    }
    rowArray.sort(function (a, b) {
        var aTds = a.getElementsByTagName("td");
        if (colIndex >= aTds.length || colIndex < 0) {
            return 0;
        }
        var aVal = parseFloat(aTds[colIndex].innerHTML); // convert the value to a number
        var bTds = b.getElementsByTagName("td");
        if (colIndex >= bTds.length || colIndex < 0) {
            return 0;
        }
        var bVal = parseFloat(bTds[colIndex].innerHTML); // convert the value to a number
        if (sortOrder === 'ascending') { //TODO determine if it needs to switch sorting somehow 
            if (aVal > bVal) {
                return -1;
            } else if (aVal < bVal) {
                return 1;
            } else {
                return 0;
            }
        }
        else {
            if (aVal < bVal) {
                return -1;
            } else if (aVal > bVal) {
                return 1;
            } else {
                return 0;
            }
        }
    });
    sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';

    // Clear the table body, then add the sorted rows to the table
    var tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    for (var i = 0; i < rowArray.length; i++) {
        tbody.appendChild(rowArray[i]);
    }
}

function calculateBigrams(renderTable) {
    // get the text from the textarea
    var text = document.getElementById("textarea").value;

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
    for (var i = 0; i < bigrams.length; i++) {
        var bigram = bigrams[i];
        if (bigram in bigramCounts) {
            bigramCounts[bigram]++;
        } else {
            bigramCounts[bigram] = 1;
        }
    }

    var table = "<table id='bigramtable'><thead><tr><th>Bigram Pair</th><th>Count \u2195</th></tr></thead><tbody>";

    // loop through the properties of the bigramCounts object
    for (var bigram in bigramCounts) {
        table += "<tr><td>" + bigram + "</td><td>" + bigramCounts[bigram] + "</td></tr>"
    }
    table += '</tbody></table>';

    var div = document.getElementById("bigram-counts-div")
    // add the table to the div element
    div.innerHTML = '';
    div.innerHTML += `<p>Words analyzed:  ${wordCount}</p><p>Unique words analyzed: ${uniqueWords.length}</p>`;

    if (renderTable) {
        div.innerHTML += table;
        // Get all the column headers in the table
        var headers = document.getElementById('bigramtable').getElementsByTagName("th");
        headers[1].addEventListener("click", function (event) {
            // Then sort the table by calling the sortTable function
            sortTable("bigramtable", 1);
        });
        addCSVButton("bigramtable", "Bigram Counts");
    }

    return bigramCounts;
}

function createFrequencyTable() {
    var bigramCounts = calculateBigrams(false);

    var div = document.getElementById("bigram-counts-div")


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

    // Create the html string
    var html = "<table id='bigramFrequencies'><thead>";

    // Create the header row
    html += "<tr>";
    html += "<th></th>"; // Add an empty cell in the top-left corner
    for (var i = 0; i < 26; i++) {
        html += "<th>" + String.fromCharCode(65 + i) + "</th>";
    }
    html += "</tr></thead><tbody>";

    // Create the data rows
    for (var i = 0; i < 26; i++) {
        html += "<tr>";
        // Create the row header for this row
        html += "<th>" + String.fromCharCode(65 + i) + "</th>";
        // Create the data cells for this row
        for (var j = 0; j < 26; j++) {
            // Get the value from the matrix for this cell
            const value = matrix[i][j];
            const normalizedVal = normalizedMatrix[i][j];
            // Calculate the percentage value
            const percentage = ((value * 100) / matrix.flat().reduce((a, b) => a + b)).toFixed(1);
            const bgColor = `rgb(${255 - normalizedVal}, ${255 - normalizedVal}, ${255 - normalizedVal})`;
            // Set the text color to white if the background color is close to black
            let textColor = "black";
            if (normalizedVal > 255 / 2) {
                textColor = "white";
            }
            // Create the td element and set its background color
            html += `<td style="background-color: ${bgColor}; color: ${textColor}">${percentage}</td>`;
        }

        html += "</tr>";
    }



    // Close the table
    html += "</tbody></table>";
    div.innerHTML += html;
    addCSVButton("bigramFrequencies", "Bigram Frequencies");
}