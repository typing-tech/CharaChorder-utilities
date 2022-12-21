function convertKeyboardLayout(str, from, to) {
  // Create an object that maps the characters in the 'from' keyboard layout
  // to the corresponding characters in the 'to' keyboard layout
  const map = {};
  for (let i = 0; i < from.length; i++) {
    map[from.charAt(i)] = to.charAt(i);
  }

  // Convert the string by replacing each character with its corresponding
  // character in the 'to' keyboard layout
  let converted = '';
  for (let i = 0; i < str.length; i++) {
    // Check if the current substring starts with "RH_" or "LH_"
    if (str.substr(i, 3) === 'RH_' || str.substr(i, 3) === 'LH_') {
      // If it does, add the substring to the converted string as-is
      converted += str.substr(i, 3);
      // Skip the rest of the characters in the substring
      i += 3;

      // Skip all the characters in the word that follows "RH_" or "LH_"
      // until we reach a space or the end of the string
      while (i < str.length && str.charAt(i) !== ' ') {
        converted += str.charAt(i);
        i++;
      }
    } else if (str.charAt(i) === '+') {
      // If it is, add it to the converted string as-is
      converted += '+';
    } else if (str.substr(i, 3) === 'Dup') {
      // If it is, add it to the converted string as-is
      converted += 'Dup';
      // Skip the next two characters since they are part of the "Dup" substring
      i += 2;
    } else if (str.substr(i, 3) === 'BAC') {
      // If it is, add it to the converted string as-is
      converted += 'BAC';
      // Skip the next two characters since they are part of the "BAC" substring
      i += 2;
    } else {
      // If it's not a + or "Dup", replace it with its corresponding character in the 'to' keyboard layout
      converted += map[str.charAt(i)] || str.charAt(i);
    }
  }
  return converted;
}

// Get the input element and the convert button
const input = document.querySelector('input[type="file"]');
const convertButton = document.querySelector('#convert');

// Set up an event listener for the convert button
convertButton.addEventListener('click', () => {
  const keyboardLayoutSelected = document.getElementById("keyboard-layout").value;
  const originalKeyboardLayoutSelected = document.getElementById("original-layout").value;
  // switch based on the selected value
  switch (keyboardLayoutSelected) {
    case "dvorak":
      tostr = "1234567890[]',.pyfgcrl/=\\aoeuidhtns-;qjkxbmwvz";
      break;
    case "colemak":
      tostr = '1234567890-=qwfpgjluy;[]\\arstdhneio\'zxcvbkm,./';
      break;
    case "qwerty":
      tostr = "1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./";
      break;
    default:
      tostr = "1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./";
      break;
  }
  switch (originalKeyboardLayoutSelected) {
    case "dvorak":
      fromstr = "1234567890[]',.pyfgcrl/=\\aoeuidhtns-;qjkxbmwvz"
      break;
    case "colemak":
      fromstr = '1234567890-=qwfpgjluy;[]\\arstdhneio\'zxcvbkm,./';
      break;
    case "qwerty":
      fromstr = "1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./";
      break;
    default:
      fromstr = "1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./";
      break;
  }
  // Read the contents of the file from the input
  const file = input.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    // Parse the CSV data
    const csvData = reader.result;
    const lines = csvData.split('\n');
    const newLines = [];

    // Convert the first column from one keyboard layout to another
    for (const line of lines) {
      const columns = line.split(',');
      const newColumns = [
        convertKeyboardLayout(columns[0],fromstr,tostr), 
        ...columns.slice(1),
      ];
      newLines.push(newColumns.join(','));
    }

    // Create a new Blob object with the modified CSV data
    const modifiedCsv = newLines.join('\n');
    const modifiedBlob = new Blob([modifiedCsv], { type: 'text/csv' });

    // Provide a download link for the user to download the modified file
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(modifiedBlob);
    a.download = originalKeyboardLayoutSelected + '_converted_to_' + keyboardLayoutSelected + '.csv';
    a.click();
  };
});