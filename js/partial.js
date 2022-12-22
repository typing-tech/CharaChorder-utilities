/**
 * Creates a HTML table of partial anagram pairs and inserts it into the DOM.
 *
 * @param {string} divId - The ID of the div element where the table will be inserted.
 * @return {undefined}
 */
function createPartialAnagramTable(divId) {
    var inputString = document.getElementById("textarea").value;

    // Find the partial anagram pairs
    const pairs = findPartialAnagrams(inputString);

    // Build up the HTML table as a string
    let table = '<table id="anagramsTable"><thead><tr><th>Anagrams - Word (Count)</th></tr></thead><tbody>';
    for (const pair of pairs) {
        table += '<tr>';
        var wordsAndFrequencies = [];
        for (let i = 0; i < pair.length; i++) {
            var word = pair[i];
            var count = countWordOccurrences(inputString, word);
            wordsAndFrequencies.push(word + " (" + count + ")")
        }
        // Sort the wordsAndFrequencies array in descending order by count
        wordsAndFrequencies.sort(function(a, b) {
            // Use regular expressions to extract the count from each element
            const countA = a.match(/\(([^)]+)\)/)[1];
            const countB = b.match(/\(([^)]+)\)/)[1];
            // Compare the counts and return the result
            return countB - countA;
        });
        const words = wordsAndFrequencies.join(', ');
        table += `<td>${words}</td>`;
        table += '</tr>';
    }
    table += '</tbody></table>';

    // Find the div element
    const div = document.getElementById(divId);
    div.innerHTML = table;
    addCSVButton("anagramsTable", "Partial Anagrams");
}



/**
* Clean a given string by replacing new line and tab characters with spaces, removing consecutive spaces, and lowercasing and removing punctuation from the words.
*
* @param {string} inputString - The input string to be cleaned.
* @return {Array} An array of strings representing the cleaned words in the input string.
*/
function getCleanWordsFromString(inputString) {
    // Replace all new line and tab characters with a space character, and remove consecutive spaces
    const textWithSpaces = inputString.replace(/[\n\t]/g, ' ').replace(/\s+/g, ' ');

    // Split the text into an array of words
    const origWords = textWithSpaces.split(' ').map(word => word.replace(/[^\w\s]/g, ''));
    const words = origWords
        // Remove empty strings from the array
        .filter(word => word.trim().length > 0)
        // Convert all words to lower case
        .map(word => word.toLowerCase());
    return words;
}

/**
* Finds all partial anagram pairs in a given string.
*
* @param {string} inputString - The input string to search for partial anagram pairs.
* @return {Array} An array of partial anagram matches
*/
function findPartialAnagrams(inputString) {
    const words = getCleanWordsFromString(inputString);

    // Initialize an empty array to store the result
    const result = [];

    const uniqueWords = [...new Set(words)];

    // Iterate through the array of words
    for (let i = 0; i < uniqueWords.length; i++) {
        // For each word, compare it to the other words in the array
        for (let j = 0; j < uniqueWords.length; j++) {
            // Skip the current word if it is being compared to itself
            if (i !== j) {
                // Check if the words are equal
                if (uniqueWords[i] !== uniqueWords[j]) {
                    // If they are not equal, check if they are partial anagrams
                    const uniqueLetters1 = [...new Set(uniqueWords[i].split(''))];
                    const uniqueLetters2 = [...new Set(uniqueWords[j].split(''))];

                    // Check if each unique letter in one word appears in the other word
                    if (uniqueLetters1.every(letter => uniqueLetters2.includes(letter)) && uniqueLetters2.every(letter => uniqueLetters1.includes(letter))) {
                        // Check if the pair has already been added to the result array
                        if (!result.some(pair => pair.includes(uniqueWords[i]) && pair.includes(uniqueWords[j]))) {
                            if (result.length === 0) {
                                result.push([uniqueWords[i], uniqueWords[j]]);
                            } else {
                                let found = false;
                                for (let k = 0; k < result.length; k++) {
                                    if (result[k].includes(uniqueWords[i]) || result[k].includes(uniqueWords[j])) {
                                        if (!(result[k].includes(uniqueWords[i]))) {
                                            result[k].push(uniqueWords[i]);
                                        }
                                        if (!(result[k].includes(uniqueWords[j]))) {
                                            result[k].push(uniqueWords[j]);
                                        }
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    result.push([uniqueWords[i], uniqueWords[j]]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Return the result array
    // Sort the result array by the largest list of partial anagrams first
    result.sort((a, b) => b.length - a.length);
    return result;
}

/**
* Count the number of occurrences of a given word in a given text.
*
* @param {string} textInput - The input text to search for the word.
* @param {string} word - The word to search for in the text.
* @return {number} The number of occurrences of the word in the text.
*/
function countWordOccurrences(textInput, word) {
    var words = getCleanWordsFromString(textInput);
    let count = 0;
    for (let i = 0; i < words.length; i++) {
        if (words[i] === word) {
            count++;
        }
    }
    return count;
}