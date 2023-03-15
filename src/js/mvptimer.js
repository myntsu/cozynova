import { DateTime } from "luxon";

const mvpSelect = document.getElementById("mvp-select");
const mvpContainer = document.getElementById("mvp-container");
const showMvpBtn = document.getElementById("show-mvp-btn");
const respawnSelect = document.getElementById("respawn-select");

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

function showMvp(mvp, selectedRespawn) {
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
    const mapLabel = document.createElement("div");
    const mapValue = document.createElement("div");
    const cdrLabel = document.createElement("div");
    const cdrValue = document.createElement("div");
    const countdownLabel = document.createElement("div");
    const countdownValue = document.createElement("div");

    mapLabel.textContent = "Map:";
    mapValue.textContent = selectedRespawn;
    cdrLabel.textContent = "Cooldown (minutes):";
    cdrValue.textContent = `${Math.floor(respawn / (60 * 1000))}`;
    countdownLabel.textContent = "Respawn in:";
    countdownValue.classList.add("countdown-timer");

    respawnContainer.appendChild(mapLabel);
    respawnContainer.appendChild(mapValue);
    respawnContainer.appendChild(cdrLabel);
    respawnContainer.appendChild(cdrValue);
    respawnContainer.appendChild(countdownLabel);
    respawnContainer.appendChild(countdownValue);

    startTimer(respawn, countdownValue, maxDelay, countdownLabel);
  }

  mvpCard.appendChild(document.createElement("h2")).textContent = mvp.name;
  mvpCard
    .appendChild(document.createElement("img"))
    .setAttribute("src", mvp.image);
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

function msToHours(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor(((ms % 3600000) % 60000) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer(ms, countdownCell, maxDelay, countdownLabel) {
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

getMvps().then((mvps) => {
  mvps.forEach((mvp) => {
    createOption(mvp, mvpSelect);
  });
});

function createToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  return toast;
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.innerText = `${text}`;
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.bottom = "-50px";
  toast.style.transform = "translateX(-50%)";
  toast.style.padding = ".75rem 1rem";
  toast.style.backgroundColor = "hsl(var(--important))";
  toast.style.color = "hsl(var(--white))";
  toast.style.borderRadius = ".25rem";
  toast.style.zIndex = "1000";
  toast.style.textAlign = "center";
  toast.classList.add("shadow-container");
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
  }, 2000);
}

showMvpBtn.addEventListener("click", async () => {
  const selectedMvpId = parseInt(mvpSelect.value, 10);
  const selectedRespawn = respawnSelect.value;
  const mvps = await getMvps();
  const mvp = mvps.find((m) => m.id === selectedMvpId);
  if (mvp) {
    showMvp(mvp, selectedRespawn);
  } else {
    showToast("Please select an MVP!"); // show the toast
  }
});


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