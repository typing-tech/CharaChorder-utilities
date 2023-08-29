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

function findPartialAnagrams(inputString) {
    const words = getCleanWordsFromString(inputString);
    const result = [];
    const uniqueWords = [...new Set(words)];

    // Calculate the total number of iterations (for progress calculation)
    const totalIterations = uniqueWords.length * (uniqueWords.length - 1);
    console.time("Analyzing Time");
    console.log("Expected total iterations:", totalIterations);
    let currentIteration = 0;

    for (let i = 0; i < uniqueWords.length; i++) {
        // For each word, compare it to the other words in the array
        for (let j = 0; j < uniqueWords.length; j++) {
            // Skip the current word if it is being compared to itself
            if (i !== j) {
                // Increment current iteration and calculate progress
                currentIteration++;
                
                const progress = (currentIteration / totalIterations) * 100;
                if (currentIteration % 100000 === 0) {
                    //console.log(progress)
                    postMessage({ type: 'progress', progress });
                }

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
    console.timeEnd("Analyzing Time");
    console.time("Sorting Time"); // Start the timer with label "Sorting Time"
    const resultWithCounts = [];

    for (const group of result) {
        const groupWithCounts = group.map(word => {
            return { word: word, count: countWordOccurrences(inputString, word) };
        });
        resultWithCounts.push(groupWithCounts);
    }

    // Sort the result array by the largest list of partial anagrams first
    resultWithCounts.sort((a, b) => b.length - a.length);
    console.timeEnd("Sorting Time"); // End the timer with label "Sorting Time"

    return resultWithCounts;
}

export function mainWorkerFunction(e) {
    if (e.data.type === 'computeAnagrams') {
        postMessage({ type: 'progress', progress: 0 });  // Initial progress message
        const result = findPartialAnagrams(e.data.input);
        postMessage({ type: 'result', result });  // Final result
    }
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = mainWorkerFunction;