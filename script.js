const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");

// listen for submission of form
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const word = wordInput.value.trim();
// code for handling empty input 
  if (word === "") {
    console.log("please enter a word");
    return;
  }

  console.log("word entered:", word);
});

// API conntection part

async function fetchWord(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Word not found.");
    }

    const data = await response.json();

    return data;
    
}



