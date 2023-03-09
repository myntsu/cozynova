// Content tables
$(".deploy-content-table").click(function () {
  $("#Content-Table").toggle("slow");
  $(".shortcut-nav").toggle("slow");
});

// Data (ACD)
$(".data").click(function () {
  $(".text-default").toggle();
  $(".text-swap").toggle();
});

// Observations
$(".observations").click(function () {
  $(".items-obs").toggleClass("decorator");
  $(".obs-swap").toggle();
});

// Skills
$(".skills").click(function () {
  $(".name-toggle").toggle();
  $(".skill-icons").toggleClass("grid-expanded");
});

// Consumables
$(".consumables").click(function () {
  $(".consumable-toggle").toggle();
  $(".consumable-text").toggle();
});

// Autoloot
$(".autoloot").click(function () {
  $(".autoloot-text").slideToggle("slow");
});

// Tutorial
$(".tutorial").click(function () {
  $(".tutorial-rewards").toggle();
  $(".tutorial-swappable").toggle();
});

// Eden Academy
$(".eden-academy").click(function () {
  $(".eden-academy-rewards").toggle();
  $(".eden-academy-swappable").toggle();
});

// Copy to clipboard
let lootList = document.querySelector("#Autoloot");

function copyClipBoard(value) {
  let tempInput = document.createElement("TEXTAREA");
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

lootList.addEventListener("click", (e) => {
  let copyBtn = e.target.closest("button");
  if (!copyBtn) return;
  let text = copyBtn
    .closest(".autoloot-selector")
    .querySelector('[id*="Autoloot"]').innerText;

  console.dir(text);
  copyClipBoard(text);
  showToast(text);
});

// Toast from copying to clipboard
function showToast(text) {
  const toast = document.createElement("div");
  toast.innerText = `Copied ${text}`;
  toast.style.position = "fixed";
  toast.style.bottom = "-50px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.padding = "10px 15px";
  toast.style.backgroundColor = "hsl(var(--important))";
  toast.style.color = "hsl(var(--white))";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "1000";
  toast.classList.add("shadow-container");
  document.body.appendChild(toast);

  // Animate toast message
  let pos = -50;
  const interval = setInterval(frame, 1);
  function frame() {
    if (pos === 10) {
      clearInterval(interval);
      setTimeout(() => {
        toast.remove();
      }, 2000);
    } else {
      pos++;
      toast.style.bottom = pos + "px";
    }
  }
}

const parentDivs = document.querySelectorAll('.select-dynamic-title');
  
parentDivs.forEach((parentDiv) => {
  const selectElement = parentDiv.querySelector('.select-title');
  
  selectElement.addEventListener('change', (event) => {
    const parentDiv = event.target.closest('.select-dynamic-title');
    parentDiv.setAttribute('title', event.target.selectedOptions[0].title);
  });
});