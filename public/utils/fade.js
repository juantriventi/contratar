document.addEventListener("DOMContentLoaded", function() {
    const wordToChange = document.getElementById("word-to-change");
    const words = ["TRABAJO", "EMPLEADO"];
    let index = 0; // Start with "TRABAJO"

    function updateWord() {
      wordToChange.innerHTML = `
        <span class="text-blue-600 word-fade">${words[index]}</span>
      `;

      setTimeout(() => {
        index = (index + 1) % words.length;
        wordToChange.innerHTML = `
          <span class="text-blue-600 word-fade">${words[index]}</span>
        `;
      }, 5000);
    }

    updateWord();
    setInterval(updateWord, 5000);
  });