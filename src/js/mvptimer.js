import { DateTime } from "luxon";

const mvpSelect = document.getElementById("mvp-select");
const mvpContainer = document.getElementById("mvp-container");
const showMvpBtn = document.getElementById("show-mvp-btn");
const respawnSelect = document.getElementById("respawn-select");

const deathTimeHours = document.getElementById("death-time-hours");
const deathTimeMinutes = document.getElementById("death-time-minutes");
const deathTimeSeconds = document.getElementById("death-time-seconds");

async function getMvps() {
  const response = await fetch("../mvplist.json");
  const mvps = await response.json();
  return mvps;
}

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

function showMvp(mvp, selectedRespawn, deathTime) {
  const mvpCard = document.createElement("div");
  const respawnContainer = document.createElement("div");

  // Get the custom cdr value from the input field in seconds
  const customCdrHours =
    parseInt(document.getElementById("cdr-input-hours").value) || 0;
  const customCdrMinutes =
    parseInt(document.getElementById("cdr-input-minutes").value) || 0;
  const customCdrSeconds =
    parseInt(document.getElementById("cdr-input-seconds").value) || 0;

  // Get the custom cdr value from the input field
  const customCdr =
    customCdrHours * 3600000 +
    customCdrMinutes * 60000 +
    customCdrSeconds * 1000;

  // Determine which cdr value to use
  const respawnInfo = mvp.respawn.find((r) => r.map === selectedRespawn);
  const respawn = customCdr || respawnInfo?.cdr;
  const maxDelay = respawnInfo?.max_delay;
  if (!respawn) {
    const errorText = document.createElement("p");
    errorText.textContent = "MVP not found";
    mvpCard.appendChild(errorText);
  } else {
    const mapValue = document.createElement("div");
    const mapImage = document.createElement("img");
    const cdrLabel = document.createElement("div");
    const cdrValue = document.createElement("div");
    const countdownLabel = document.createElement("div");
    const countdownValue = document.createElement("div");

    mapValue.textContent = selectedRespawn;
    mapImage.setAttribute("src", `../assets/img/maps/${selectedRespawn}.png`);
    mapImage.style.width = "150px";
    mapImage.style.height = "150px";
    cdrLabel.textContent = "Cooldown (minutes):";
    cdrValue.textContent = `${Math.floor(respawn / (60 * 1000))}`;
    countdownLabel.textContent = "Respawn in:";
    countdownValue.classList.add("countdown-timer");

    respawnContainer.appendChild(mapValue);
    respawnContainer.appendChild(mapValue);
    respawnContainer.appendChild(mapImage);
    respawnContainer.appendChild(cdrLabel);
    respawnContainer.appendChild(cdrValue);
    respawnContainer.appendChild(countdownLabel);
    respawnContainer.appendChild(countdownValue);

    startTimer(respawn, countdownValue, maxDelay, countdownLabel, deathTime);
  }

  mvpCard.appendChild(document.createElement("h2")).textContent = mvp.name;
  const mvpImage = document.createElement("img");
  mvpImage.setAttribute("src", `../assets/img/mobs/${mvp.id}.gif`);
  mvpCard.appendChild(mvpImage);
  mvpCard.appendChild(
    document.createElement("p")
  ).textContent = `ID: ${mvp.id}`;
  mvpCard.appendChild(document.createElement("h3")).textContent = "Respawn";
  mvpCard.appendChild(respawnContainer);

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    mvpContainer.removeChild(mvpCard);
  });
  mvpCard.appendChild(removeButton);

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
function startTimer(ms, countdownCell, maxDelay, countdownLabel, deathTime) {
  const currentTime = DateTime.utc().minus({ hours: 7 });

  const deathTimeInGMT7 = currentTime.startOf("day").plus({
    hours: deathTime.hours,
    minutes: deathTime.minutes,
    seconds: deathTime.seconds,
  });

  const timeDifferenceMs = currentTime.diff(deathTimeInGMT7, "milliseconds").milliseconds;

  if (deathTime.hours === 0 && deathTime.minutes === 0 && deathTime.seconds === 0) {
    startCDRTimer(ms, countdownCell, maxDelay, countdownLabel);
  } else if (timeDifferenceMs < ms) {
    startCDRTimer(ms - timeDifferenceMs, countdownCell, maxDelay, countdownLabel);
  } else if (timeDifferenceMs >= ms && timeDifferenceMs < ms + maxDelay) {
    startMaxDelayTimer(ms + maxDelay - timeDifferenceMs, countdownCell);
  } else {
    showToast("The MVP is alive!");
  }
}

function startCDRTimer(ms, countdownCell, maxDelay, countdownLabel) {
  const interval = setInterval(() => {
    ms -= 1000;
    if (ms < 0) {
      clearInterval(interval);
      const audio = new Audio("/assets/sound/omori-heal-sound.mp3"); // Replace with actual sound file path
      audio.play();
      countdownCell.textContent = "0% chance";
      countdownLabel.textContent = "Respawning with a:";
      startMaxDelayTimer(maxDelay, countdownCell);
    } else {
      countdownCell.textContent = msToHours(ms);
    }
  }, 1000);
}

function startMaxDelayTimer(ms, countdownCell) {
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

updateClock();
setInterval(updateClock, 1000);

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

deathTimeHours.addEventListener("change", handleDeathTimeChange);
deathTimeMinutes.addEventListener("change", handleDeathTimeChange);
deathTimeSeconds.addEventListener("change", handleDeathTimeChange);

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

validateInput(deathTimeHours, 0, 23);
validateInput(deathTimeMinutes, 0, 59);
validateInput(deathTimeSeconds, 0, 59);

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