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
function speak(text) {
  if (!canSpeak || !text) return;
  window.speechSynthesis.cancel(); // stop anything still playing
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function playPronunciation(word, audioUrl) {
  if (audioUrl) {
    new Audio(audioUrl).play().catch(() => speak(word));
  } else {
    speak(word);
  }
}

if (canSpeak) {
  speakButton.addEventListener("click", () => {
    const word = wordInput.value.trim();

    if (word === "") {
      showError("Type a word first to hear it spoken.");
      wordInput.focus();
      return;
    }

    speak(word);
  });
} else {
  speakButton.hidden = true;
}
// updated helpers
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  resultsEl.setAttribute("aria-busy", String(isLoading));
  if (isLoading) resultsEl.replaceChildren(el("p", "loading", "Searching…"));
}