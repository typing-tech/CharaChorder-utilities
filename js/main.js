document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
      .then(response => response.text())
      .then(html => {
        document.querySelector('header').innerHTML = html;
      })
      .catch(err => console.warn('Something went wrong.', err));
  });  