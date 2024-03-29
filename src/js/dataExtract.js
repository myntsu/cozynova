import { showToast, loadCards, clearMvp } from './mvptimer.js';

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

// Function to expand keys
function expandKeys(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const expandedKey = Object.keys(keyMapping).find(k => keyMapping[k] === key);
    if (typeof obj[key] === "object" && obj[key] !== null) {
      result[expandedKey] = expandKeys(obj[key]);
    } else {
      result[expandedKey] = obj[key];
    }
    return result;
  }, {});
}

// Exporting data
extractButton.addEventListener("click", () => {
  const savedCards = Object.keys(localStorage)
    .filter((key) => key.startsWith("card-"))
    .map((key) => JSON.parse(localStorage.getItem(key)))
    .map((card) => shortenKeys(card));

  if (savedCards.length === 0) {
    showToast("There are no cards to export.");
    return;
  }

  const savedCardsString = JSON.stringify(savedCards);

  // Display the data on the webpage
  const outputElement = document.querySelector("#output");
  outputElement.textContent = savedCardsString;
});

// Importing data
const loadButton = document.querySelector("#import-button");
const output = document.querySelector("#output");
loadButton.addEventListener("click", () => {
  if (output.value.trim() === "") {
    showToast("You must add something to import.");
    return;
  }

  const cardsToLoad = JSON.parse(output.value);
  cardsToLoad.forEach((cardData) => {
    const expandedCardData = expandKeys(cardData);
    localStorage.setItem(`card-${expandedCardData.cardId}`, JSON.stringify(expandedCardData));
  });
  
  // Call loadCards function after importing
  loadCards();
});

function clearAllMvps() {
  const mvpCards = document.querySelectorAll('.mvp-card'); 

  mvpCards.forEach((mvpCard) => {
    const countdownValue = mvpCard.querySelector('.countdown-timer');
    clearMvp(mvpCard, countdownValue);
  });
}

document.getElementById('clear-all-button').addEventListener('click', clearAllMvps);
