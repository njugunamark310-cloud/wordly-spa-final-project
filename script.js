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



