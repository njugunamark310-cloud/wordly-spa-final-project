const searchForm =document.querySelector("#search-form");
const wordInput =document.querySelector("#word-input");

// listen for submission of form
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const word = wordInput.ariaValueMax.trim();

  console.log("word entered:", word);
});