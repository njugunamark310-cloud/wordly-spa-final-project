const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");
const errorMessage =document.querySelector("error-message");

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
    console.log("Dictionary data:", data);
  } catch (error) {
    errorMessage.hidden = false;
    errorMessage.textContent =
     "Sorry, the dictionary service is temporarily unavailable. Please try again later.";

    console.log("Error:", error.message);
  }



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



})
