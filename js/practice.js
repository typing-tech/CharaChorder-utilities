let minChordLength = 1;
let maxChordLength = 10;
let minIndex = 0;
let maxIndex = 100000;

function startPractice(event) {
  event.preventDefault();
  return practice.loadUploadedChords()
    .then(() => {
      practice.practice();
    });
}

function copyToClipboard(event) {
  event.preventDefault();
  return practice.loadUploadedChords()
    .then(() => {
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
      maxIndex = practice.words.length - 1;
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
    this.words = [];
    this.totalWords = 0;
    this.correctWords = 0;
    this.currentWord = '';
    this.currentChord = '';
  }

  practice() {
    if (Object.keys(this.uploadedChords).length === 0) {
      alert('No chords added');
      return;
    }

    const practiceWindow = document.getElementById('practice-window');
    practiceWindow.style.display = 'block';
    this.showQuestion();
  }

  showQuestion() {
    let randomIndex = Math.floor(Math.random() * this.words.length);
    this.currentWord = this.words[randomIndex];
    this.currentChord = this.uploadedChords[this.currentWord];
    let questionWord = document.getElementById('question-word');
    let chord = document.getElementById('chord');
    chord.style.display = 'none';
    questionWord.textContent = this.currentWord;
    document.getElementById('textInput').focus();
  }

  checkAnswer() {
    let answer = document.getElementById('textInput');
    let totalWordsLabel = document.getElementById('total-words');
    let correctWordsLabel = document.getElementById('correct-words');
    if (answer.value.trim().toLowerCase() === this.currentWord.trim().toLowerCase()) {
      this.correctWords++;
      correctWordsLabel.style.color = '#4CAF50';
      this.showQuestion();
    } else {
      let chord = document.getElementById('chord');
      chord.textContent = this.currentChord;
      chord.style.display = 'block';
      correctWordsLabel.style.color = '#FF0000';
    }
    answer.value = '';
    this.totalWords++;
    totalWordsLabel.textContent = this.totalWords;
    correctWordsLabel.textContent = this.correctWords;
    document.getElementById('line').style.display = 'block';
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
            this.uploadedChords[word] = chord;
          }
        });

        this.loadFilteredChords();
        this.words = Object.keys(this.filterChords);
        resolve();
      };

      reader.onerror = reject;
      reader.readAsText(chordFile);
    });
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
    if (event.key === 'Enter') {
      practice.checkAnswer();
      event.preventDefault();
    }
  });
});

let practice = new ChordPractice();