const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");
const errorMessage =document.querySelector("#error-message");

// listen for submission of form
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const word = wordInput.value.trim();
// code for handling empty input 
  if (word === "") {
    console.log("please enter a word");
    return;
  }

  try {
  const data = await fetchWord(word);

  const entry = data.entries[0];
  const definition = entry.senses[0].definition;

  document.querySelector("#results").innerHTML = `
    <h2 class="word-heading">${word}</h2>
    <p class="part-of-speech">
      ${entry.partOfSpeech}
    </p>
    <div class="definition-item">
      <p>${definition}</p>
    </div>
  `;
}

catch (error) {
  errorMessage.hidden = false;
  errorMessage.textContent =
    "Unable to retrieve this word. Please check your connection and try again.";

  console.log("Error:", error.message);
}



// API conntection part

async function fetchWord(word) {
    const url = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Word not found.");
    }

    const data = await response.json();

    return data;
    
}



})
