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
    let table = '<table id="anagramsTable"><thead><tr><th>Anagrams</th></tr></thead><tbody>';
    for (const pair of pairs) {
        table += '<tr>';
        const words = pair.join(', ');
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
* Finds all partial anagram pairs in a given string.
*
* @param {string} inputString - The input string to search for partial anagram pairs.
* @return {Array} An array of partial anagram pairs. Each pair is represented as an array of two strings.
*/
function findPartialAnagrams(inputString) {

    // Replace all new line and tab characters with a space character, and remove consecutive spaces
    const textWithSpaces = inputString.replace(/[\n\t]/g, ' ').replace(/\s+/g, ' ');

    // Split the text into an array of words
    const origWords = textWithSpaces.split(' ').map(word => word.replace(/[^\w\s]/g, ''));
    const words = origWords
        // Remove empty strings from the array
        .filter(word => word.trim().length > 0)
        // Convert all words to lower case
        .map(word => word.toLowerCase());

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