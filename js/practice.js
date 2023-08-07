function startPractice(event) {
  event.preventDefault();
  return practice.loadUploadedChords()
    .then(() => {
      practice.practice();

    });
}

class ChordPractice {
  constructor() {
    this.uploadedChords = {};
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
    this.words = Object.keys(this.uploadedChords);
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

        resolve();
      };

      reader.onerror = reject;
      reader.readAsText(chordFile);
    });
  }
}
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('startPracticeButton').addEventListener('click', startPractice);
  document.getElementById('chordFileInput').addEventListener('change', function () {
    document.getElementById('chordFileInputName').textContent = this.files[0].name;
  });
  document.getElementById('textInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      practice.checkAnswer();
      event.preventDefault();
    }
  });
});
let practice = new ChordPractice();