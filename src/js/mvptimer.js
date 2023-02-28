const mvpSelect = document.getElementById("mvp-select");
const mvpContainer = document.getElementById("mvp-container");
const showMvpBtn = document.getElementById("show-mvp-btn");
const respawnSelect = document.getElementById("respawn-select");

async function getMvps() {
  const response = await fetch("/src/json/mvplist.json");
  const mvps = await response.json();
  return mvps;
}

function createOption(mvp, selectElement) {
    const option = document.createElement("option");
    option.value = mvp.id;
    option.textContent = `${mvp.id} - ${mvp.name}`;
    option.setAttribute('data-respawn', JSON.stringify(mvp.respawn));
    selectElement.appendChild(option);
  }

  fetch("/src/json/mvplist.json")
  .then(response => response.json())
  .then(data => {
    data.forEach(mvp => {
      createOption(mvp, mvpSelect);
    });

    mvpSelect.addEventListener('change', () => {
      const selectedOption = mvpSelect.options[mvpSelect.selectedIndex];
      const respawnData = JSON.parse(selectedOption.getAttribute('data-respawn'));

      // Clear current respawn options
      while (respawnSelect.firstChild) {
        respawnSelect.removeChild(respawnSelect.firstChild);
      }

      // Add new respawn options
      if (respawnData) {
        respawnData.forEach(location => {
          const option = document.createElement("option");
          option.value = location.map;
          option.textContent = location.map;
          respawnSelect.appendChild(option);
        });
      }
    });
  });

function showMvp(mvp) {
    const mvpCard = document.createElement("div");
    const table = document.createElement("table");
  
    // Create rows and cells for each respawn location
    for (const respawn of mvp.respawn) {
      const row = document.createElement("tr");
      const mapCell = document.createElement("td");
      const cdrCell = document.createElement("td");
      const maxDelayCell = document.createElement("td");
  
      mapCell.textContent = respawn.map;
      cdrCell.textContent = `${respawn.cdr}ms`;
      maxDelayCell.textContent = `${respawn.max_delay}ms`;
  
      row.appendChild(mapCell);
      row.appendChild(cdrCell);
      row.appendChild(maxDelayCell);
      table.appendChild(row);
    }
  
    // Add table and other information to mvpCard
    mvpCard.appendChild(document.createElement("h2")).textContent = mvp.name;
    mvpCard.appendChild(document.createElement("img")).setAttribute("src", mvp.image);
    mvpCard.appendChild(document.createElement("p")).textContent = `ID: ${mvp.id}`;
    mvpCard.appendChild(document.createElement("h3")).textContent = "Respawn";
    mvpCard.appendChild(table);
  
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      const optionToRemove = mvpSelect.querySelector(`option[value="${mvp.id}"]`);
      if (optionToRemove) {
        mvpSelect.removeChild(optionToRemove);
      }
      mvpContainer.removeChild(mvpCard);
    });
    mvpCard.appendChild(removeButton);
  
    mvpContainer.appendChild(mvpCard);
  }

getMvps().then((mvps) => {
  populateMvpSelect(mvps);
  console.log(mvps);
});

showMvpBtn.addEventListener("click", async () => {
  const selectedMvpId = parseInt(mvpSelect.value, 10);
  const mvps = await getMvps();
  const mvp = mvps.find((m) => m.id === selectedMvpId);
  if (mvp) {
    showMvp(mvp);
  } else {
    mvpContainer.innerHTML = "MVP not found";
  }
});
