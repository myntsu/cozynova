import { DateTime } from "luxon";

const mvpContainer = document.getElementById("mvp-container");
const showMvpBtn = document.getElementById("show-mvp-btn");
const respawnSelect = document.getElementById("respawn-select");

const deathTimeHours = document.getElementById("death-time-hours");
const deathTimeMinutes = document.getElementById("death-time-minutes");
const deathTimeSeconds = document.getElementById("death-time-seconds");

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
  option.textContent = `${mvp.id} - ${mvp.name}`;
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

    countdownValue.timerInterval = startTimer(respawn, countdownValue, maxDelay, countdownLabel, deathTime);

    restartButton.addEventListener("click", () => {
      clearInterval(countdownValue.timerInterval);
      countdownValue.timerInterval = startTimer(respawn, countdownValue, maxDelay, countdownLabel, { hours: 0, minutes: 0, seconds: 0 });
    });

    removeButton.addEventListener("click", () => {
      clearInterval(countdownValue.timerInterval);
      mvpContainer.removeChild(mvpCard);
    });
  }
  mvpCard.appendChild(mvpHeader);
  mvpCard.appendChild(mvpInfo);
  mvpCard.appendChild(mvpMap);
  mvpCard.appendChild(mvpRespawn);
  
  mvpContainer.appendChild(mvpCard);
}

// Verification to see if cards exist
function cardExists(id, selectedRespawn) {
  const mvpCards = Array.from(mvpContainer.children);
  return mvpCards.some((card) => {
    const mvpId = card.querySelector("p").textContent.slice(4);
    const mapName = card.querySelectorAll("div")[1].textContent;
    return mvpId === id && mapName === selectedRespawn;
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
let activeTimer = null;
let activeMaxDelayTimer = null;
function startTimer(ms, countdownCell, maxDelay, countdownLabel, deathTime) {
  if (activeTimer) {
    clearTimeout(activeTimer);
  }
  if (activeMaxDelayTimer) {
    clearTimeout(activeMaxDelayTimer);
  }

  const currentTime = DateTime.utc().minus({ hours: 7 });

  const deathTimeInGMT7 = currentTime.startOf("day").plus({
    hours: deathTime.hours,
    minutes: deathTime.minutes,
    seconds: deathTime.seconds,
  });

  const timeDifferenceMs = currentTime.diff(deathTimeInGMT7, "milliseconds").milliseconds;

  let interval;
  if (deathTime.hours === 0 && deathTime.minutes === 0 && deathTime.seconds === 0) {
    interval = startCDRTimer(ms, countdownCell, maxDelay, countdownLabel);
  } else if (timeDifferenceMs < ms) {
    interval = startCDRTimer(ms - timeDifferenceMs, countdownCell, maxDelay, countdownLabel);
  } else if (timeDifferenceMs >= ms && timeDifferenceMs < ms + maxDelay) {
    interval = startMaxDelayTimer(ms + maxDelay - timeDifferenceMs, countdownCell);
  } else {
    showToast("The MVP is alive!");
  }

  return interval;
}
// CDR start
function startCDRTimer(ms, countdownCell, maxDelay, countdownLabel) {
  console.log("CDR Timer Started");
  const interval = setInterval(() => {
    ms -= 1000;
    if (ms < 0) {
      clearInterval(interval);
      const audio = new Audio("/assets/sound/omori-heal-sound.mp3"); // Replace with actual sound file path
      audio.play();
      countdownCell.textContent = "0% chance";
      countdownLabel.textContent = "Chance to respawn:";
      startMaxDelayTimer(maxDelay, countdownCell);
    } else {
      countdownCell.textContent = msToHours(ms);
    }
  }, 1000);
  return interval;
}
// Delay start
function startMaxDelayTimer(ms, countdownCell) {
  console.log("Max Delay Timer Started");
  const maxDelayMs = ms;
  let elapsedMs = 0;
  const interval = setInterval(() => {
    ms -= 1000;
    elapsedMs += 1000;
    if (ms < 0) {
      clearInterval(interval);
      countdownCell.textContent = `100% chance (${msToHours(maxDelayMs)})`;
    } else {
      const percentage = Math.round(((maxDelayMs - ms) / maxDelayMs) * 100);
      countdownCell.textContent = `${percentage}% chance (${msToHours(elapsedMs)})`;
    }
  }, 1000);
  return interval;
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

// Death timer
function formatTime(hours, minutes, seconds) {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
function convertToGMT7(hours, minutes, seconds) {
  const now = DateTime.utc();
  const gmt7Time = now.set({ hour: hours - 7, minute: minutes, second: seconds });
  return {
    hours: gmt7Time.hour,
    minutes: gmt7Time.minute,
    seconds: gmt7Time.second,
  };
}
function handleDeathTimeChange() {
  const hours = parseInt(deathTimeHours.value) || 0;
  const minutes = parseInt(deathTimeMinutes.value) || 0;
  const seconds = parseInt(deathTimeSeconds.value) || 0;

  const gmt7Time = convertToGMT7(hours, minutes, seconds);
  const totalSeconds = gmt7Time.hours * 3600 + gmt7Time.minutes * 60 + gmt7Time.seconds;

  const formattedTime = formatTime(gmt7Time.hours, gmt7Time.minutes, gmt7Time.seconds);
  console.log(`Total seconds: ${totalSeconds}, Formatted time: ${formattedTime}`);
}

// Validation for death timer
function validateInput(input, min, max) {
  input.addEventListener("input", () => {
    const value = parseInt(input.value, 10);
    if (value < min) {
      input.value = min;
    } else if (value > max) {
      input.value = max;
    }
  });
}

// Cards generator on click
showMvpBtn.addEventListener("click", async () => {
  const selectedMvpId = parseInt(mvpSelect.value, 10);
  const selectedRespawn = respawnSelect.value;
  const mvps = await getMvps();
  const deathTime = {
    hours: parseInt(deathTimeHours.value) || 0,
    minutes: parseInt(deathTimeMinutes.value) || 0,
    seconds: parseInt(deathTimeSeconds.value) || 0,
  };
  const mvp = mvps.find((m) => m.id === selectedMvpId);

  const respawnInfo = mvp.respawn.find((r) => r.map === selectedRespawn);
  const cdr = respawnInfo?.cdr;
  const maxDelay = respawnInfo?.max_delay;
  const totalDelay = cdr + maxDelay;

  const currentTime = DateTime.utc().minus({ hours: 7 });
  const deathTimeInGMT7 = currentTime.startOf("day").plus({
    hours: deathTime.hours,
    minutes: deathTime.minutes,
    seconds: deathTime.seconds,
  });

  const timeDifferenceMs = currentTime.diff(deathTimeInGMT7, "milliseconds").milliseconds;

  if (deathTimeInGMT7 > currentTime) {
    showToast("The MVP is alive!");
  } else if (timeDifferenceMs > totalDelay) {
    showToast("The MVP is alive!");
  } else if (cardExists(selectedMvpId.toString(), selectedRespawn)) {
    showToast("This MVP already exists!");
  } else if (mvp) {
    showMvp(mvp, selectedRespawn, deathTime);
  } else {
    showToast("Please select an MVP!");
  }
});

deathTimeHours.addEventListener("change", handleDeathTimeChange);
deathTimeMinutes.addEventListener("change", handleDeathTimeChange);
deathTimeSeconds.addEventListener("change", handleDeathTimeChange);
validateInput(deathTimeHours, 0, 23);
validateInput(deathTimeMinutes, 0, 59);
validateInput(deathTimeSeconds, 0, 59);

updateClock();
setInterval(updateClock, 1000);