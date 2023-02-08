document.getElementById("copyForPractice").addEventListener("click", function () {
    // Get the input file
    var inputFile = document.getElementById("input-file").files[0];

    var reader = new FileReader();
    reader.onload = function () {
        var csvString = reader.result;
        var rows = csvString.split("\n");

        // Initialize an object to store the words of chordMaps
        var words = [];

        rows.forEach(function (row) {
            console.log(row);
            var cells = row.split(",");
            var chord = cells[1];
            words.push(chord);
            console.log(chord)
        });
        console.log(words)

        var wordList = words.join(" | ");
        copyTextToClipboard(wordList);
        toastr.success('Word list copied to clipboard');
    };

    reader.readAsText(inputFile);
});

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

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
