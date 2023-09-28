import { DateTime } from "luxon";

const mvpContainer = document.getElementById("mvp-container");
const showMvpBtn = document.getElementById("show-mvp-btn");
const respawnSelect = document.getElementById("respawn-select");

const deathTimeHours = document.getElementById("death-time-hours");
const deathTimeMinutes = document.getElementById("death-time-minutes");
const deathTimeSeconds = document.getElementById("death-time-seconds");

const sortByNameBtn = document.getElementById("sort-by-name");
const sortByRespawnBtn = document.getElementById("sort-by-respawn");

const mvpSelect = document.getElementById("mvp-select");
async function getMvps() {
  const response = await fetch("../mvplist.json");
  const mvps = await response.json();
  return mvps;
}

// Populating options
function createOption(mvp, selectElement) {
  const option = document.createElement("option");
  option.value = mvp.id;
  option.textContent = `${mvp.name} [${mvp.id}]`;
  option.setAttribute("data-respawn", JSON.stringify(mvp.respawn));
  selectElement.appendChild(option);
}

// Data fetch from MVP list JSON file
fetch("../mvplist.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((mvp) => {
      createOption(mvp, mvpSelect);
    });

    mvpSelect.addEventListener("change", () => {
      const selectedOption = mvpSelect.options[mvpSelect.selectedIndex];
      const respawnData = JSON.parse(
        selectedOption.getAttribute("data-respawn")
      );

      // Clear current respawn options
      while (respawnSelect.firstChild) {
        respawnSelect.removeChild(respawnSelect.firstChild);
      }

      // Add new respawn options
      if (respawnData) {
        respawnData.forEach((location) => {
          const option = document.createElement("option");
          option.value = location.map;
          option.textContent = location.map;
          respawnSelect.appendChild(option);
        });
      }
    });
  });

// Populating card
function showMvp(mvp, selectedRespawn, deathTime, existingCardData) {
  const mvpCard = document.createElement("div");
  mvpCard.classList.add("mvp-card");
  mvpCard.setAttribute("data-mvp-id", mvp.id);
  mvpCard.setAttribute("data-map", selectedRespawn);
  mvpCard.setAttribute(
    "data-card-id",
    existingCardData ? existingCardData.cardId : generateUniqueId()
  );

  const mvpHeader = document.createElement("div");
  mvpHeader.classList.add("mvp-header");

  const mvpInfo = document.createElement("div");
  mvpInfo.classList.add("mvp-info");

  const mvpMap = document.createElement("div");
  mvpMap.classList.add("mvp-map");

  const mvpRespawn = document.createElement("div");
  mvpRespawn.classList.add("mvp-respawn");

  // Header
  const mvpName = document.createElement("h2");
  mvpName.textContent = mvp.name;
  mvpName.title = `${mvp.name}`;
  mvpHeader.appendChild(mvpName);

  const restartButton = document.createElement("button");
  restartButton.classList.add("restart-button");
  mvpHeader.appendChild(restartButton);

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-button");
  mvpHeader.appendChild(removeButton);

  // Info
  const mvpImage = document.createElement("img");
  mvpImage.setAttribute("src", `../assets/img/mobs/${mvp.id}.gif`);
  mvpInfo.appendChild(mvpImage);

  const mvpId = document.createElement("p");
  mvpId.textContent = `ID: ${mvp.id}`;
  mvpInfo.appendChild(mvpId);

  // Map
  const mapImage = document.createElement("img");
  mapImage.setAttribute("src", `../assets/img/maps/${selectedRespawn}.png`);
  mapImage.style.width = "150px";
  mapImage.style.height = "150px";
  mvpMap.appendChild(mapImage);

  const mapValue = document.createElement("div");
  mapValue.textContent = selectedRespawn;
  mvpMap.appendChild(mapValue);

  // Respawn
  const respawnInfo = mvp.respawn.find((r) => r.map === selectedRespawn);
  const respawn = respawnInfo?.cdr;
  const maxDelay = respawnInfo?.max_delay;
  if (!respawn) {
    const errorText = document.createElement("p");
    errorText.textContent = "MVP not found";
    mvpRespawn.appendChild(errorText);
  } else {
    const cdrLabel = document.createElement("i");
    cdrLabel.textContent = `Cooldown: ${Math.floor(respawn / (60 * 1000))}min.`;
    mvpRespawn.appendChild(cdrLabel);

    const respawnTimer = document.createElement("div");
    respawnTimer.classList.add("respawn-timer");

    const countdownLabel = document.createElement("span");
    countdownLabel.textContent = "Respawn:";
    respawnTimer.appendChild(countdownLabel);

    const countdownValue = document.createElement("span");
    countdownValue.classList.add("countdown-timer");
    respawnTimer.appendChild(countdownValue);

    mvpRespawn.appendChild(respawnTimer);

    countdownValue.timerInterval = startTimer(
      respawn,
      countdownValue,
      maxDelay,
      countdownLabel,
      deathTime
    );

    restartButton.addEventListener("click", () => {
      if (countdownValue.currentTimeout) {
        console.log("Stopping Current Timeout");
        clearTimeout(countdownValue.currentTimeout);
        countdownValue.currentTimeout = null;
      }

      countdownValue.timerInstance = startTimer(
        respawn,
        countdownValue,
        maxDelay,
        countdownLabel,
        { hours: 0, minutes: 0, seconds: 0 }
      );
    });

    removeButton.addEventListener("click", () => {
      // Clear the timer timeout before removing the card
      if (countdownValue.currentTimeout) {
        clearTimeout(countdownValue.currentTimeout);
        countdownValue.currentTimeout = null;
      }
      console.log(Boolean(startCDRTimer));
      mvpContainer.removeChild(mvpCard);

      // Remove the card from local storage
      localStorage.removeItem(`card-${mvpCard.getAttribute("data-card-id")}`);
    });
  }
  mvpCard.appendChild(mvpHeader);
  mvpCard.appendChild(mvpInfo);
  mvpCard.appendChild(mvpMap);
  mvpCard.appendChild(mvpRespawn);

  mvpContainer.appendChild(mvpCard);

  if (!existingCardData) {
    saveCardData(
      mvp,
      selectedRespawn,
      deathTime,
      mvpCard.getAttribute("data-card-id")
    );
  }
}

// MS to Hours converting
function msToHours(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor(((ms % 3600000) % 60000) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Timer start
function startTimer(ms, countdownCell, maxDelay, countdownLabel, deathTime) {
  const select = document.querySelector("#timezone-select");
  const selectedOption = select.options[select.selectedIndex];
  const offset = parseInt(selectedOption.value);

  const currentTime = DateTime.utc().plus({ hours: offset });
  console.log(currentTime);

  const deathTimeInGMT7 = currentTime.startOf("day").plus({
    hours: deathTime.hours,
    minutes: deathTime.minutes,
    seconds: deathTime.seconds,
  });

  const elapsedTimeMs =
    deathTime && currentTime.diff(deathTimeInGMT7, "milliseconds").milliseconds;

  const remainingCDRTimer = ms - elapsedTimeMs;
  const remainingMaxDelayTimer = maxDelay - (elapsedTimeMs - ms);

  const timerInstance = {
    cdrInterval: null,
    maxDelayInterval: null,
  };

  let interval;
  if (
    deathTime.hours === 0 &&
    deathTime.minutes === 0 &&
    deathTime.seconds === 0
  ) {
    interval = startCDRTimer(
      ms,
      countdownCell,
      maxDelay,
      countdownLabel,
      timerInstance
    );
  } else {
    if (remainingCDRTimer > 0) {
      interval = startCDRTimer(
        remainingCDRTimer,
        countdownCell,
        maxDelay,
        countdownLabel,
        timerInstance
      );
    } else if (remainingMaxDelayTimer > 0) {
      interval = startMaxDelayTimer(
        countdownCell,
        maxDelay,
        elapsedTimeMs - ms
      );
    } else {
      showToast("The MVP is alive!");
    }
  }

  countdownCell.timerInstance = timerInstance;
  return timerInstance;
}

// Audio play
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffer = new Promise((resolve, reject) => {
  fetch("/assets/sound/omori-heal-sound.mp3")
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer, resolve, reject))
    .catch((error) => console.error("Audio fetch error:", error));
});

function playAudio() {
  audioBuffer.then((buffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  });
}

// CDR start
function startCDRTimer(ms, countdownCell, maxDelay, countdownLabel) {
  // console.log("Countdown started.");

  const startTime = performance.now();
  const targetEndTime = startTime + ms;

  function cdrTick() {
    const currentTime = performance.now();
    const elapsedMs = currentTime - startTime;
    const remainingMs = Math.max(targetEndTime - currentTime, 0);

    if (remainingMs <= 0) {
      playAudio();
      countdownCell.textContent = `0% chance (${msToHours(ms)})`;
      countdownLabel.textContent = "Chance to respawn:";
      clearTimeout(countdownCell.currentTimeout);
      countdownCell.currentTimeout = startMaxDelayTimer(
        countdownCell,
        maxDelay,
        0
      );
    } else {
      countdownCell.textContent = `${msToHours(ms - elapsedMs)}`;
      countdownCell.currentTimeout = setTimeout(cdrTick, 1000);
    }
  }

  countdownCell.currentTimeout = setTimeout(cdrTick, 1000);
  return countdownCell.currentTimeout;
}

// Delay start
function startMaxDelayTimer(countdownCell, maxDelay, elapsedTimeMs) {
  // console.log("Delay time started.");
  const startTime = performance.now() - (elapsedTimeMs || 0);
  const targetEndTime = startTime + maxDelay;

  function maxDelayTick() {
    // console.log("Max Delay Timer tick");
    const currentTime = performance.now();
    const elapsedMs = currentTime - startTime;
    const remainingMs = Math.max(targetEndTime - currentTime, 0);

    // Add the console log here
    console.log("elapsedMs:", elapsedMs, "maxDelay:", maxDelay);

    if (remainingMs <= 0) {
      countdownCell.textContent = `100% chance (${msToHours(maxDelay)})`;
      clearTimeout(countdownCell.currentTimeout);
    } else {
      const percentage = Math.round((elapsedMs / maxDelay) * 100);
      countdownCell.textContent = `${percentage}% chance (${msToHours(
        elapsedMs
      )})`;
      countdownCell.currentTimeout = setTimeout(maxDelayTick, 1000);
    }
  }

  countdownCell.currentTimeout = setTimeout(maxDelayTick, 1000);
  return countdownCell.currentTimeout;
}

// Cards generator on click
showMvpBtn.addEventListener("click", async () => {
  const selectedMvpId = parseInt(mvpSelect.value, 10);
  const selectedRespawn = respawnSelect.value;

  // Condition 1: Check if selectedMvpId is NaN and show a toast message
  if (isNaN(selectedMvpId)) {
    showToast("Error: You didn't select anything");
    return;
  }

  const mvps = await getMvps();
  const mvp = mvps.find((m) => m.id === selectedMvpId);
  const respawnInfo = mvp.respawn.find((r) => r.map === selectedRespawn);
  const cdr = respawnInfo?.cdr;
  const maxDelay = respawnInfo?.max_delay;
  const sumOfCDRandMaxDelayMs = (cdr ?? 0) + (maxDelay ?? 0);

  const select = document.querySelector("#timezone-select");
  const selectedOption = select.options[select.selectedIndex];
  const offset = parseInt(selectedOption.value);

  const currentTime = DateTime.utc().plus({ hours: offset });

  // Condition 2: Use CDR value by default if user inputs nothing in the death time
  const hasUserInput =
    deathTimeHours.value.trim() !== "" ||
    deathTimeMinutes.value.trim() !== "" ||
    deathTimeSeconds.value.trim() !== "";

  const deathTime = hasUserInput
    ? {
        hours: parseInt(deathTimeHours.value) || 0,
        minutes: parseInt(deathTimeMinutes.value) || 0,
        seconds: parseInt(deathTimeSeconds.value) || 0,
      }
    : null;

  if (deathTime) {
    const deathTimeInGMT7 = currentTime.startOf("day").plus({
      hours: deathTime.hours,
      minutes: deathTime.minutes,
      seconds: deathTime.seconds,
    });

    const timeDifferenceMs = currentTime.diff(
      deathTimeInGMT7,
      "milliseconds"
    ).milliseconds;

    // Condition 3: If the Time Difference is greater than the sum of CDR and MaxDelay
    if (timeDifferenceMs > sumOfCDRandMaxDelayMs) {
      showToast("Error: The MVP is alive");
      return;
    }

    // Condition 4: If the time of death is greater than the current time
    if (deathTimeInGMT7 > currentTime) {
      showToast("Error: Can't set a time in the future");
      return;
    }
  }

  if (cardExists(selectedMvpId.toString(), selectedRespawn)) {
    showToast("Error: Can't add duplicates");
  } else {
    showMvp(
      mvp,
      selectedRespawn,
      deathTime || { hours: 0, minutes: 0, seconds: 0 }
    );
  }
  clearInputFields();
});

// Verification to see if cards exists
function cardExists(id, selectedRespawn) {
  const mvpCards = Array.from(mvpContainer.children);
  return mvpCards.some((card) => {
    const mvpId = card.getAttribute("data-mvp-id");
    const mapName = card.getAttribute("data-map");
    return mvpId === id.toString() && mapName === selectedRespawn;
  });
}

// Toast function
let toastActive = false;
function showToast(text) {
  if (toastActive) return;

  toastActive = true;

  // Create toast element and set the text
  const toast = document.createElement("div");
  toast.innerText = `${text}`;

  // Add CSS classes
  toast.classList.add("quick-toast", "shadow-container");

  // Append toast to the body
  document.body.appendChild(toast);

  // Animate toast message
  toast.animate([{ bottom: "-50px" }, { bottom: "30px" }], {
    duration: 300,
    easing: "ease-out",
    fill: "forwards",
  });

  // Remove the toast after 2 seconds
  setTimeout(() => {
    toast.remove();
    toastActive = false;
  }, 2000);
}

// MVP search
const mvpSearch = document.getElementById("mvp-search");
mvpSearch.addEventListener("input", async () => {
  const searchText = mvpSearch.value.toLowerCase();
  const mvps = await getMvps();
  const filteredMvps = mvps.filter((mvp) =>
    mvp.name.toLowerCase().includes(searchText)
  );

  // Clear the current options in the select element
  while (mvpSelect.firstChild) {
    mvpSelect.removeChild(mvpSelect.firstChild);
  }

  // Create an option for each filtered MVP
  filteredMvps.forEach((mvp) => {
    createOption(mvp, mvpSelect);
  });

  // Trigger a change event to refresh the respawn locations
  mvpSelect.dispatchEvent(new Event("change"));
});

// Enter key listener to fire the card creation
function triggerShowMvpBtn(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    showMvpBtn.click();
  }
}

mvpSearch.addEventListener("keydown", triggerShowMvpBtn);
mvpSelect.addEventListener("keydown", triggerShowMvpBtn);
respawnSelect.addEventListener("keydown", triggerShowMvpBtn);

// Validation for death timer
function validateInput(input, min, max) {
  input.addEventListener("input", () => {
    const value = parseInt(input.value, 10);
    if (isNaN(value)) {
      input.value = "";
    } else if (value < min) {
      input.value = min;
    } else if (value > max) {
      input.value = max;
    }
  });
}

function clearInputFields() {
  deathTimeHours.value = "";
  deathTimeMinutes.value = "";
  deathTimeSeconds.value = "";
}

// Card sorting
function sortCards(type) {
  const mvpCards = Array.from(mvpContainer.children);

  const sortedCards = mvpCards.sort((a, b) => {
    if (type === "name") {
      const aName = a.querySelector(".mvp-header h2").textContent;
      const bName = b.querySelector(".mvp-header h2").textContent;
      return aName.localeCompare(bName);
    } else if (type === "respawn") {
      const aRespawn = getTimeRemaining(a.querySelector(".countdown-timer"));
      const bRespawn = getTimeRemaining(b.querySelector(".countdown-timer"));
      return aRespawn - bRespawn;
    }
  });

  mvpContainer.innerHTML = "";
  sortedCards.forEach((card) => {
    mvpContainer.appendChild(card);
  });
}

function getTimeRemaining(timerElement) {
  const timeText = timerElement.textContent;
  const [hours, minutes, seconds] = timeText.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Fetching the MVP ID
function getMvpById(mvpList, mvpId) {
  return mvpList.find((mvp) => mvp.id === mvpId);
}

// Saving cards into local storage
function saveCardData(mvp, selectedRespawn, deathTime, cardId) {
  // If deathTime is not provided, assume deathTime is now
  if (
    deathTime.hours === 0 &&
    deathTime.minutes === 0 &&
    deathTime.seconds === 0
  ) {
    const select = document.querySelector("#timezone-select");
    const selectedOption = select.options[select.selectedIndex];
    const offset = parseInt(selectedOption.value);

    const currentTime = DateTime.utc().plus({ hours: offset });
    
    deathTime = {
      hours: currentTime.hour,
      minutes: currentTime.minute,
      seconds: currentTime.second,
    };
  }

  const cardData = {
    cardId: cardId,
    mvpId: mvp.id,
    map: selectedRespawn,
    deathTime: deathTime,
  };

  localStorage.setItem(`card-${cardId}`, JSON.stringify(cardData));
}

// Loading saved cards
function loadCards() {
  fetch("../mvplist.json")
    .then((response) => response.json())
    .then((mvpList) => {
      const savedCards = Object.keys(localStorage)
        .filter((key) => key.startsWith("card-"))
        .map((key) => JSON.parse(localStorage.getItem(key)));

      if (savedCards.length > 0) {
        // Clear the mvpContainer before appending the cards from local storage
        mvpContainer.innerHTML = "";

        savedCards.forEach((cardData) => {
          const mvp = getMvpById(mvpList, cardData.mvpId);
          const selectedRespawn = cardData.map;
          const deathTime = cardData.deathTime;

          // Pass the existing card data
          showMvp(mvp, selectedRespawn, deathTime, cardData);
        });
      }
    });
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Event listeners
// Auto-skip inputs
deathTimeHours.addEventListener("input", () => {
  if (deathTimeHours.value.length === 2) {
    deathTimeMinutes.focus();
  }
});

deathTimeMinutes.addEventListener("input", () => {
  if (deathTimeMinutes.value.length === 2) {
    deathTimeSeconds.focus();
  }
});

deathTimeSeconds.addEventListener("input", () => {
  if (deathTimeSeconds.value.length === 2) {
    // Trigger the event listener for the showMvpBtn
    showMvpBtn.click();
  }
});

// For "Sort by Name" button
sortByNameBtn.addEventListener("click", () => {
  sortCards("name");
  sortByNameBtn.classList.add("active");
  sortByRespawnBtn.classList.remove("active");
});

// For "Sort by Respawn Time" button
sortByRespawnBtn.addEventListener("click", () => {
  sortCards("respawn");
  sortByRespawnBtn.classList.add("active");
  sortByNameBtn.classList.remove("active");
});

validateInput(deathTimeHours, 0, 23);
validateInput(deathTimeMinutes, 0, 59);
validateInput(deathTimeSeconds, 0, 59);

// Loading cards saved in local storage
window.onload = loadCards;

// Hiding elements from within the cards
function hideCardElements(hide) {
  const cards = document.querySelectorAll(".mvp-card");

  cards.forEach((card) => {
    const elementsAndClasses = [
      { element: card.querySelector(".mvp-header"), className: "toggled" },
      { element: card.querySelector(".mvp-info"), className: "toggled" },
      { element: card.querySelector(".respawn-timer"), className: "toggled" },
      {
        element: card.querySelector(".mvp-header h2"),
        className: "hiding-card-elements",
      },
      {
        element: card.querySelector(".mvp-info p"),
        className: "hiding-card-elements",
      },
      {
        element: card.querySelector(".mvp-map"),
        className: "hiding-card-elements",
      },
      {
        element: card.querySelector(".mvp-respawn i"),
        className: "hiding-card-elements",
      },
    ];

    elementsAndClasses.forEach(({ element, className }) => {
      if (hide) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    });
  });
}

const hideElementsButton = document.querySelector("#hide-card-elements-button");
hideElementsButton.addEventListener("click", () => {
  const isHidden = localStorage.getItem("hideCardElements") === "true";
  localStorage.setItem("hideCardElements", isHidden ? "false" : "true");
  hideCardElements(!isHidden);

  hideElementsButton.setAttribute("aria-pressed", !isHidden);
});

const isHiddenOnInit = localStorage.getItem("hideCardElements") === "true";
hideElementsButton.setAttribute("aria-pressed", isHiddenOnInit);

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      const isHidden = localStorage.getItem("hideCardElements") === "true";
      hideCardElements(isHidden);
    }
  });
});

observer.observe(mvpContainer, { childList: true });

// Get references to DOM elements
const select = document.querySelector("#timezone-select");
const currentTimeElement = document.querySelector("#current-time");
const timeText = document.querySelector(".time-text");

// Populate the timezone select element with options
for (let i = -12; i <= 14; i++) {
  const date = new Date();
  const offset = i * 60;
  date.setUTCMinutes(date.getUTCMinutes() + offset);
  const timeString = date.toUTCString().split(" ")[4];
  const hoursAndMinutes = timeString.slice(0, 5);

  const option = document.createElement("option");
  option.value = i;
  option.textContent = `GMT${i >= 0 ? "+" : ""}${i} (${hoursAndMinutes})`;
  select.appendChild(option);
}

// Retrieve the saved timezone from local storage and set the select element value
const savedTimezone = localStorage.getItem("timezone");
if (savedTimezone !== null) {
  select.value = savedTimezone;
} else {
  // If no saved timezone is found, set the select element value to the user's current timezone
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const gmtOffset = -offset / 60;
  select.value = gmtOffset;
}

// Add an event listener to the select element to save the selected timezone to local storage and update the timeText element
select.addEventListener("change", () => {
  localStorage.setItem("timezone", select.value);
  if (select.value === "-7") {
    timeText.textContent = "Server time";
    localStorage.setItem("timeText", "Server time");
  } else if (select.value === localStorage.getItem("timezone")) {
    timeText.textContent = "Your selection";
    localStorage.setItem("timeText", "Your selection");
  } else {
    timeText.textContent = "Default time";
    localStorage.setItem("timeText", "Default time");
  }
});

// Retrieve the saved value for the "server time", "your time" and "local time" options from local storage and update the timeText element
const savedTimeText = localStorage.getItem("timeText");
if (savedTimeText !== null) {
  timeText.textContent = savedTimeText;
}

// Define the clock function to update the current time element with the selected timezone
function clock() {
  const date = new Date();
  const offset = parseInt(select.value, 10) * 60;
  date.setUTCMinutes(date.getUTCMinutes() + offset);
  const timeString = date.toUTCString().split(" ")[4];
  currentTimeElement.textContent = timeString;
}

// Call the clock function every second to update the current time element
setInterval(clock, 1000);

// Select the settings button and the temporary settings div
const settingsButton = document.querySelector("#settings");
const temporarySettingsDiv = document.querySelector(".temporary-settings");

// Define a function to handle clicks on the settings button
function handleButtonClick() {
  // Toggle the "show" class on the temporary settings div
  temporarySettingsDiv.classList.toggle("show");
}

// Define a function to handle clicks on the document
function handleDocumentClick(event) {
  // Check if the click happened outside of the temporary settings div and the settings button
  if (
    !temporarySettingsDiv.contains(event.target) &&
    !settingsButton.contains(event.target)
  ) {
    // Remove the "show" class from the temporary settings div
    temporarySettingsDiv.classList.remove("show");
  }
}

// Add event listeners for the click and touchend events to the settings button
settingsButton.addEventListener("click", handleButtonClick);
settingsButton.addEventListener("touchend", handleButtonClick);

// Add event listeners for the click and touchend events to the document
document.addEventListener("click", handleDocumentClick);
document.addEventListener("touchend", handleDocumentClick);
