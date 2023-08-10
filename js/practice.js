let minChordLength = 1;
let maxChordLength = 10;
let minIndex = 0;
let maxIndex = 100000;
let upcomingWordsLength = 5;
let maxWords = 25;
let maxMistypedWords = 10;

function startPractice(event) {
  event.preventDefault();
  practice.loadUploadedChords().then(() => {
    practice.practice();
  });
}

function copyToClipboard(event) {
  event.preventDefault();
  practice.loadUploadedChords().then(() => {
    text = Object.keys(practice.filterChords).join(' | ');
    navigator.clipboard.writeText(text).then(function () {
      console.log('Text successfully copied to clipboard');
    }).catch(function (err) {
      console.error('Unable to copy text to clipboard', err);
    });
  });
}

function showFilterChords() {
  return practice.loadUploadedChords()
    .then(() => {
      maxIndex = Object.keys(practice.uploadedChords).length - 1;
      let filterChords = document.getElementById('filter-chords');
      $("#slider-range-keys").slider({
        range: true,
        min: 1,
        max: 10,
        values: [minChordLength, maxChordLength],
        slide: function (event, ui) {
          $("#selected-values-keys").text("Selected range: " + ui.values[0] + " - " + ui.values[1]);
          minChordLength = ui.values[0];
          maxChordLength = ui.values[1];
        }
      });
      $("#slider-range-index").slider({
        range: true,
        min: 0,
        max: maxIndex,
        values: [minIndex, maxIndex],
        slide: function (event, ui) {
          $("#selected-values-index").text("Selected range: " + ui.values[0] + " - " + ui.values[1]);
          minIndex = ui.values[0];
          maxIndex = ui.values[1];
        }
      });
      filterChords.style.display = 'block';
    });
}

class ChordPractice {
  constructor() {
    this.uploadedChords = {};
    this.filterChords = {};
    this.totalWords = 0;
    this.correctWords = 0;
    this.currentWord = '';
    this.currentChord = '';
    this.upcomingWords = [];
    this.correctCharsCount = 0;
    this.misTypedChords = {};
    this.startTime = null;
  }

  practice() {
    if (Object.keys(this.uploadedChords).length === 0) {
      alert('No chords added');
      return;
    }

    let resultsWindow = document.getElementById('results-window');
    resultsWindow.style.display = 'none';
    const practiceWindow = document.getElementById('practice-window');
    practiceWindow.style.display = 'block';
    this.totalWords = 0;
    this.correctWords = 0;
    this.upcomingWords = [];
    this.loadUpcomingWords();
    this.showQuestion();
    this.startTime = new Date();
  }

  showQuestion() {
    this.currentWord = this.upcomingWords[0];
    this.currentChord = this.filterChords[this.currentWord];
    let chord = document.getElementById('chord');
    chord.style.display = 'none';
    document.getElementById('first-word').textContent = this.currentWord;
    var fontSize = 25;
    var decrement = 3;
    $('#other-words').empty();
    this.upcomingWords.slice(1).forEach(function (word) {
      var span = $('<span>').text(word + ' ').css('font-size', fontSize + 'px');
      $('#other-words').append(span);
      fontSize -= decrement;
    });
    document.getElementById('textInput').focus();
    this.upcomingWords.shift();
    this.upcomingWords.push(this.nextWord());
  }

  checkAnswer() {
    let answer = document.getElementById('textInput');
    let totalWordsLabel = document.getElementById('total-words');
    let correctWordsLabel = document.getElementById('correct-words');
    let firstWordLabel = document.getElementById('first-word');
    let typedWord = answer.value.trim().toLowerCase();
    if (typedWord === this.currentWord.trim().toLowerCase()) {
      this.correctWords++;
      this.correctCharsCount += this.currentWord.length;
      correctWordsLabel.style.color = '#4CAF50';
      firstWordLabel.style.color = '#4CAF50';
      this.showQuestion();
    } else {
      if (!this.misTypedChords[this.currentWord]) {
        this.misTypedChords[this.currentWord] = [];
      }
      this.misTypedChords[this.currentWord].push(typedWord);
      let chord = document.getElementById('chord');
      chord.textContent = this.currentChord;
      chord.style.display = 'block';
      correctWordsLabel.style.color = '#FF0000';
      firstWordLabel.style.color = '#FF0000';
    }
    answer.value = '';
    this.totalWords++;
    totalWordsLabel.textContent = this.totalWords;
    correctWordsLabel.textContent = this.correctWords;
    document.getElementById('line').style.display = 'block';
    if (this.totalWords === maxWords) {
      this.showResults();
    }
  }

  showResults() {
    let practiceWindow = document.getElementById('practice-window');
    practiceWindow.style.display = 'none';
    let resultsWindow = document.getElementById('results-window');
    resultsWindow.style.display = 'block';
    document.getElementById('start-practice-button').textContent = 'Practice Again';
    document.getElementById('result-wpm').textContent = this.getWPM() + ' WPM';
    document.getElementById('result-accuracy').textContent = Math.round(this.correctWords / this.totalWords * 100) + '%';
    this.showMistypedWords();
  }

  showMistypedWords() {
    const table = document.createElement('table');
    table.style.textAlign = 'center';

    const headerRow = document.createElement('tr');
    const header1 = document.createElement('th');
    header1.textContent = 'Word';
    const header2 = document.createElement('th');
    header2.textContent = 'Mistyped As';
    headerRow.appendChild(header1);
    headerRow.appendChild(header2);
    table.appendChild(headerRow);

    const mistypedArray = Object.entries(this.misTypedChords)
      .map(([word, typedWords]) => ({ word, typedWords, count: typedWords.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxMistypedWords);

    mistypedArray.forEach(item => {
      const row = document.createElement('tr');
      const cell1 = document.createElement('td');
      cell1.textContent = item.word;
      const cell2 = document.createElement('td');
      cell2.textContent = item.typedWords.join(', ');
      row.appendChild(cell1);
      row.appendChild(cell2);
      table.appendChild(row);
    });

    $('#mistyped-words').append(table);
  }


  loadUploadedChords() {
    return new Promise((resolve, reject) => {
      let chordFileInput = document.getElementById('chordFileInput');
      let chordFile = chordFileInput.files[0];
      if (!chordFile) {
        resolve();
        return;
      }

      this.uploadedChords = {};
      var reader = new FileReader();
      reader.onload = (event) => {
        var content = event.target.result;
        var lines = content.split('\n');

        lines.forEach((line) => {
          var parts = line.split(',');
          if (parts.length === 2) {
            var chord = parts[0].trim().split(' + ');
            var word = parts[1].trim();
            if (word.includes(' ')) { return; }
            this.uploadedChords[word] = chord;
          }
        });

        this.loadFilteredChords();
        resolve();
      };

      reader.onerror = reject;
      reader.readAsText(chordFile);
    });
  }

  getWPM() {
    var currentTime = new Date();
    var elapsedTime = (currentTime - this.startTime)
    return Math.round((this.correctCharsCount / 4) / (elapsedTime / 1000 / 60));
  }

  loadUpcomingWords() {
    this.upcomingWords = Array.from(
      { length: upcomingWordsLength }, () => this.nextWord()
    );
  }

  nextWord() {
    let randomIndex = Math.floor(Math.random() * Object.keys(this.filterChords).length);
    return Object.keys(this.filterChords)[randomIndex];
  }

  loadFilteredChords() {
    this.filterChords = Object.keys(this.uploadedChords)
      .slice(minIndex, maxIndex + 1)
      .filter(key => this.uploadedChords[key].length >= minChordLength &&
        this.uploadedChords[key].length <= maxChordLength)
      .reduce((result, key) => {
        result[key] = this.uploadedChords[key];
        return result;
      }, {});
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('start-practice-button').addEventListener('click', startPractice);
  document.getElementById('copy-chords').addEventListener('click', copyToClipboard);
  document.getElementById('chordFileInput').addEventListener('change', function () {
    document.getElementById('chordFileInputName').textContent = this.files[0].name;
    showFilterChords();
  });
  document.getElementById('textInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      practice.checkAnswer();
      event.preventDefault();
    }
  });
});

let practice = new ChordPractice();