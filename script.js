const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");
const errorMessage =document.querySelector("#error-message");
const speakButton = document.querySelector("#speak-button");
const favoritesList = document.querySelector("#favorites-list");
const resultsEl = document.querySelector("#results");
const submitButton = searchForm.querySelector('[type="submit"]');

const API_URL = "https://freedictionaryapi.com/api/v1/entries/en/";
const STORAGE_KEY = "favorites";
const canSpeak = "speechSynthesis" in window;


// code for favorites
function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let favorites = loadFavorites();

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
  
  }
}

const isFavorite = (word) => favorites.includes(word.toLowerCase());

function toggleFavorite(word) {
  const key = word.toLowerCase();
  favorites = isFavorite(key)
    ? favorites.filter((f) => f !== key)
    : [...favorites, key];
  saveFavorites();
  displayFavorites();
}

function displayFavorites() {
  favoritesList.replaceChildren();

  if (favorites.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No favorites yet.";
    favoritesList.appendChild(empty);
    return;
  }

  favorites.forEach((word) => {
    const listItem = document.createElement("li");

    // clicking the word searches it again
    const wordButton = document.createElement("button");
    wordButton.type = "button";
    wordButton.className = "favorite-word";
    wordButton.textContent = word;
    wordButton.addEventListener("click", () => {
      wordInput.value = word;
      searchWord(word); // defined in Section 4
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${word} from favorites`);
    removeButton.addEventListener("click", () => toggleFavorite(word));

    listItem.append(wordButton, removeButton);
    favoritesList.appendChild(listItem);
  });
}

displayFavorites();


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

  errorMessage.hidden = true;
  errorMessage.textContent ="";

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

  const synonyms = [
  ...new Set(entry.senses.flatMap((sense) => sense.synonyms || []))
  ];


  const pronunciation = entry.pronunciations.find(
    (item) => item.type === "ipa"
  );


  document.querySelector("#results").innerHTML = `
    <h2 class="word-heading">${word}</h2>

    <button type="button" id="favorite-button"> Add to Favorites</button>

    <p class="part-of-speech">${entry.partOfSpeech}</p>

    <p class="pronunciation">${pronunciation?.text || ""}</p>

    <div class="definition-item">
      <h3>Definition</h3>
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

 const favoriteButton = document.querySelector("#favorite-button");

  favoriteButton.addEventListener("click", function () {
  if (!favorites.includes(word)) {
    favorites.push(word);
    saveFavorites();
    displayFavorites();
  }

  favoriteButton.textContent = "Added !";
  favoriteButton.disabled = true;
});

} catch (error) {
  errorMessage.hidden = false;
  errorMessage.textContent =
    "Unable to retrieve this word. Please check your connection and try again.";

  console.log("Error:", error.message);
}

});



// API conntection part

async function fetchWord(word) {
    const url = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Word not found.");
    }

    const data = await response.json();

if (!data.entries || data.entries.length === 0) {
    throw new Error("No dictionary entry found.");
}

    return data;
}
