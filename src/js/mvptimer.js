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
function showMvp(mvp, selectedRespawn, deathTime) {
  const mvpCard = document.createElement("div");
  mvpCard.classList.add("mvp-card");
  mvpCard.setAttribute("data-mvp-id", mvp.id);
  mvpCard.setAttribute("data-map", selectedRespawn);

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
      clearInterval(countdownValue.currentInterval);
      countdownValue.timerInterval = startTimer(
        respawn,
        countdownValue,
        maxDelay,
        countdownLabel,
        { hours: 0, minutes: 0, seconds: 0 }
      );
    });
    

    removeButton.addEventListener("click", () => {
      // Clear the timer interval before removing the card
      if (countdownValue.currentInterval) {
        clearInterval(countdownValue.currentInterval);
      }
      console.log(Boolean(startCDRTimer));
      mvpContainer.removeChild(mvpCard);
    });
    
  }
  mvpCard.appendChild(mvpHeader);
  mvpCard.appendChild(mvpInfo);
  mvpCard.appendChild(mvpMap);
  mvpCard.appendChild(mvpRespawn);

  mvpContainer.appendChild(mvpCard);
}

// Verification to see if cards exists
function cardExists(id, selectedRespawn) {
  const mvpCards = Array.from(mvpContainer.children);
  return mvpCards.some((card) => {
    const mvpId = card.getAttribute("data-mvp-id");
    const mapName = card.getAttribute("data-map");
    return mvpId === id.toString() && mapName === selectedRespawn;
  });
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
  const currentTime = DateTime.utc().minus({ hours: 7 });

  const deathTimeInGMT7 = currentTime.startOf("day").plus({
    hours: deathTime.hours,
    minutes: deathTime.minutes,
    seconds: deathTime.seconds,
  });

  const timeDifferenceMs = currentTime
    .diff(deathTimeInGMT7, "milliseconds")
    .toObject().milliseconds;

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
    interval = startCDRTimer(ms, countdownCell, maxDelay, countdownLabel, timerInstance);
  } else if (timeDifferenceMs < ms) {
    interval = startCDRTimer(
      ms - timeDifferenceMs,
      countdownCell,
      maxDelay,
      countdownLabel,
      timerInstance
    );
  } else if (timeDifferenceMs >= ms && timeDifferenceMs < ms + maxDelay) {
    interval = startMaxDelayTimer(
      ms + maxDelay - timeDifferenceMs,
      countdownCell
    );
  } else {
    showToast("The MVP is alive!");
  }

  return timerInstance;
}

// CDR start
function startCDRTimer(ms, countdownCell, maxDelay, countdownLabel) {
  console.log("CDR Timer Started");

  const startTime = performance.now();
  const targetEndTime = startTime + ms;

  const updateCountdown = () => {
    const currentTime = performance.now();
    const remainingMs = Math.max(targetEndTime - currentTime, 0);

    if (remainingMs <= 0) {
      const audio = new Audio("/assets/sound/omori-heal-sound.mp3");
      audio.play();
      countdownCell.textContent = "0% chance";
      countdownLabel.textContent = "Chance to respawn:";
      countdownCell.currentInterval = startMaxDelayTimer(maxDelay, countdownCell);
    } else {
      countdownCell.textContent = msToHours(remainingMs);
      requestAnimationFrame(updateCountdown);
    }
  };

  requestAnimationFrame(updateCountdown);
  countdownCell.currentInterval = null; // Since we're not using setInterval, set currentInterval to null
}

// Delay start
function startMaxDelayTimer(ms, countdownCell) {
  console.log("Max Delay Timer Started");

  const maxDelayMs = ms;
  const startTime = performance.now();

  const updateCountdown = () => {
    const currentTime = performance.now();
    const elapsedMs = currentTime - startTime;
    const remainingMs = Math.max(maxDelayMs - elapsedMs, 0);

    if (remainingMs <= 0) {
      countdownCell.textContent = `100% chance (${msToHours(maxDelayMs)})`;
    } else {
      const percentage = Math.round((elapsedMs / maxDelayMs) * 100);
      countdownCell.textContent = `${percentage}% chance (${msToHours(elapsedMs)})`;
      requestAnimationFrame(updateCountdown);
    }
  };

  requestAnimationFrame(updateCountdown);
  countdownCell.currentInterval = null; // Since we're not using setInterval, set currentInterval to null
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

// Clock
function getCurrentTimeInGMT7() {
  const now = DateTime.utc();
  const gmt7Time = now.set({ hour: now.hour - 7 });
  return gmt7Time.toFormat("HH:mm:ss");
}
function updateClock() {
  const currentTime = getCurrentTimeInGMT7();
  document.getElementById("current-time-gmt-7").textContent = currentTime;
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

  const currentTime = DateTime.utc().minus({ hours: 7 });

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
      showToast("Error: Looks like it has respawned");
      return;
    }

    // Condition 4: If the time of death is greater than the current time
    if (deathTimeInGMT7 > currentTime) {
      showToast("Error: Cannot set a time in the future");
      return;
    }
  }

  if (cardExists(selectedMvpId.toString(), selectedRespawn)) {
    showToast("Error: You can't add duplicates");
  } else {
    showMvp(
      mvp,
      selectedRespawn,
      deathTime || { hours: 0, minutes: 0, seconds: 0 }
    );
  }
  clearInputFields();
});

// Phone auto-skip inputs
const isPhone = window.innerWidth < 768;
if (isPhone) {
  // Add event listeners to the input fields
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
      // Do something when all input fields have been filled
    }
  });
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

// Event listeners
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

updateClock();
setInterval(updateClock, 1000);

let showAlert = true;

window.addEventListener("beforeunload", (e) => {
  if (showAlert) {
    e.preventDefault();
    e.returnValue = "Are you sure you want to do that?";
  }
});
