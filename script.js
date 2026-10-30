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

function updateFavoriteButton(button) {
  const saved = isFavorite(button.dataset.word);
  button.textContent = saved ? "★ In Favorites (click to remove)" : "☆ Add to Favorites";
  button.setAttribute("aria-pressed", String(saved));
}

function renderSynonymChips(synonyms) {
  const wrap = el("div", "synonym-list");
  synonyms.forEach((syn) => {
    const chip = el("button", "synonym-chip", syn);
    chip.type = "button";
    chip.title = `Look up "${syn}"`;
    chip.addEventListener("click", () => {
      wordInput.value = syn;
      searchWord(syn);
    });
    wrap.appendChild(chip);
  });
  return wrap;
}

// rendering
function renderSense(sense) {
  const item = el("li", "sense");
  item.appendChild(el("p", "definition", sense.definition || "No definition available."));

  (sense.examples || []).slice(0, 2).forEach((example) => {
    item.appendChild(el("p", "example", `“${example}”`));
  });

  if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0) {
    const line = el("p", "sense-synonyms");
    line.appendChild(el("strong", "", "Synonyms: "));
    line.appendChild(document.createTextNode(sense.synonyms.join(", ")));
    item.appendChild(line);
  }

  if (Array.isArray(sense.subsenses) && sense.subsenses.length > 0) {
    const sub = el("ol", "subsenses");
    sense.subsenses.forEach((s) => sub.appendChild(renderSense(s)));
    item.appendChild(sub);
  }
  return item;
}

function renderEntry(entry) {
  const section = el("section", "entry");
  section.appendChild(el("p", "part-of-speech", entry.partOfSpeech || ""));

  const ipa = (entry.pronunciations || []).find((p) => p.type === "ipa");
  if (ipa?.text) section.appendChild(el("p", "pronunciation", ipa.text));

  const senses = Array.isArray(entry.senses) ? entry.senses : [];
  if (senses.length === 0) {
    section.appendChild(el("p", "empty", "No definitions available for this entry."));
  } else {
    section.appendChild(el("h3", "", "Definitions"));
    const list = el("ol", "senses");
    senses.forEach((sense) => list.appendChild(renderSense(sense)));
    section.appendChild(list);
  }

  const synonyms = [...new Set(senses.flatMap((s) => s.synonyms || []))];
  if (synonyms.length > 0) {
    section.appendChild(el("h3", "", "Synonyms"));
    section.appendChild(renderSynonymChips(synonyms));
  }
  return section;
}

function renderResults(data, searchedWord) {
  const word = data.word || searchedWord;

  const header = el("div", "result-header");
  header.appendChild(el("h2", "word-heading", word));

  const audioUrl = data.entries
    .flatMap((e) => e.pronunciations || [])
    .map((p) => p.audio || p.audioUrl)
    .find(Boolean);

  if (audioUrl || canSpeak) {
    const listen = el("button", "listen-button", "🔊 Listen");
    listen.type = "button";
    listen.setAttribute("aria-label", `Hear the pronunciation of ${word}`);
    listen.addEventListener("click", () => playPronunciation(word, audioUrl));
    header.appendChild(listen);
  }

  const favoriteButton = el("button", "favorite-button");
  favoriteButton.id = "favorite-button";
  favoriteButton.type = "button";
  favoriteButton.dataset.word = word.toLowerCase();
  updateFavoriteButton(favoriteButton);
  favoriteButton.addEventListener("click", () => {
    toggleFavorite(word);
    updateFavoriteButton(favoriteButton);
  });
  header.appendChild(favoriteButton);

  const fragment = document.createDocumentFragment();
  fragment.appendChild(header);
  data.entries.forEach((entry) => fragment.appendChild(renderEntry(entry)));
  resultsEl.replaceChildren(fragment);
}

let latestRequest = 0; // lets us ignore out-of-date responses

async function searchWord(rawWord) {
  const word = rawWord.trim();
  clearError();

  if (word === "") {
    showError("Please enter a word to search.");
    wordInput.focus();
    return;
  }
  if (!/^[\p{L}][\p{L}\s'’-]*$/u.test(word)) {
    showError("Please enter a valid word using letters only.");
    wordInput.focus();
    return;
  }

  const requestId = ++latestRequest;
  setLoading(true);

  try {
    const data = await fetchWord(word);
    if (requestId !== latestRequest) return;
    renderResults(data, word);
  } catch (error) {
    if (requestId !== latestRequest) return;
    resultsEl.replaceChildren();
    if (error.name === "NotFoundError") {
      showError(`No results found for "${word}". Check the spelling and try again.`);
    } else {
      showError("Unable to retrieve this word. Please check your connection and try again.");
    }
    console.error("Dictionary lookup failed:", error);
  } finally {
    if (requestId === latestRequest) setLoading(false);
  }
}

// events 
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWord(wordInput.value);
});

wordInput.addEventListener("input", clearError);

// API
async function fetchWord(word) {
  const response = await fetch(API_URL + encodeURIComponent(word));

  if (response.status === 404) {
    const notFound = new Error("Word not found.");
    notFound.name = "NotFoundError";
    throw notFound;
  }
  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}.`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.entries) || data.entries.length === 0) {
    const notFound = new Error("No dictionary entry found.");
    notFound.name = "NotFoundError";
    throw notFound;
  }

  return data;
}