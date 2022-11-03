// Enabling popover
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))


// Enabling tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


//Get the button
let mybutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
mybutton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Data (ACD)
$(".data").click(function() {
  $(".text-default").toggle();
  $(".text-swap").toggle();
})

// Skills
$(".skills").click(function() {
  $(".name-toggle").toggle();
});

// Consumables
$(".consumables").click(function(){
  $(".consumable-toggle").toggle();
  $(".consumable-text").toggle();
})

// Autoloot
$(".autoloot").click(function() {
  $(".autoloot-text").slideToggle("slow");
})

// function copyToClipboard(element) {
//   var $temp = $("<input>");
//   $("body").append($temp);
//   $temp.val($(element).text()).select();
//   document.execCommand("copy");
//   $temp.remove();
//   }

let lootList = document.querySelector('#Autoloot')

function copyClipBoard(value) {
    let tempInput = document.createElement('TEXTAREA')
    tempInput.value = value
    document.body.appendChild(tempInput)
    tempInput.select()
    document.execCommand('copy')
    document.body.removeChild(tempInput)
}

lootList.addEventListener('click', (e) => {
  let copyBtn = e.target.closest('button')
  if (!copyBtn) return
  let text = copyBtn.closest('.shadow-container').querySelector('[id*="Autoloot"]').innerText
  
  console.dir(text)
  copyClipBoard(text)
})