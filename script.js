const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");
const errorMessage =document.querySelector("#error-message");
const speakButton = document.querySelector("#speak-button");

// new implementation of voice pronunciation
speakButton.addEventListener("click", function () {
  const word = wordInput.value.trim();

  if (word === "") {
    wordInput.focus();
    return;
  }

  const speech = new SpeechSynthesisUtterance(word);
  speech.lang ="en-US";


  window.speechSynthesis.speak(speech);
});



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
  const example = entry.senses[0].examples?.[0];
  const synonyms = entry.senses[0].synonyms || [];

  const pronunciation = entry.pronunciations.find(
    (item) => item.type === "ipa"
  );

  console.log("Pronunciation data:", entry.pronunciations);

  document.querySelector("#results").innerHTML = `
    <h2 class="word-heading">${word}</h2>

    <p class="part-of-speech">${entry.partOfSpeech}</p>

    <p class="pronunciation">${pronunciation?.text || ""}</p>

    <div class="definition-item">
      <p>${definition}</p>
    </div>
  
    ${example ? `
  <div class="example-item">
    <h3>Example</h3>
    <p>${example}</p>
  </div>
` : ""}

    ${synonyms.length > 0 ? `
  <div class="synonyms-item">
    <h3>Synonyms</h3>
    <p>${synonyms.join(", ")}</p>
  </div>
  ` : ""}
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
