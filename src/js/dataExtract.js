// Extracting cards content
const extractButton = document.querySelector("#extract-button");

// Create a mapping for the keys
const keyMapping = {
  cardId: "a",
  mvpId: "b",
  map: "c",
  deathTime: "d",
  hours: "e",
  minutes: "f",
  seconds: "g",
};

// Function to shorten keys
function shortenKeys(obj) {
  return Object.keys(obj).reduce((result, key) => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      result[keyMapping[key]] = shortenKeys(obj[key]);
    } else {
      result[keyMapping[key]] = obj[key];
    }
    return result;
  }, {});
}

// Usage
extractButton.addEventListener("click", () => {
  const savedCards = Object.keys(localStorage)
    .filter((key) => key.startsWith("card-"))
    .map((key) => JSON.parse(localStorage.getItem(key)))
    .map((card) => shortenKeys(card));

  const savedCardsString = JSON.stringify(savedCards);

  // Display the data on the webpage
  const outputElement = document.querySelector("#output");
  outputElement.textContent = savedCardsString;
});
