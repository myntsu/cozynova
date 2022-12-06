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
  $(".items-obs").toggleClass("grid-obs");
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

//Starting point
$(".starting-point").click(function () {
  $(".starting-point-text").slideToggle("slow");
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
});

// Collapsible content or accordion
// document.querySelectorAll(".button-collapse").forEach((button) => {
//   button.addEventListener("click", () => {
//     const collapseBox = button.nextElementSibling;

//     document
//       .querySelectorAll(".active-cont")
//       .forEach((el) => el.classList.remove("active-cont"));
//     document
//       .querySelectorAll(".active-btn")
//       .forEach((el) => el.classList.remove("active-btn"));

//     button.classList.toggle("active-btn");
//     collapseBox.classList.toggle("active-cont");
//   });
// });
