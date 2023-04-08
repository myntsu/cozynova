function handleClick() {
    settings.classList.toggle("gear-active");
  
    // Start the animation when the gear-active class is added
    if (settings.classList.contains("gear-active")) {
      handleInteraction();
    }
  }

const settings = document.querySelector(".fa-gear");

function handleInteraction() {
    settings.classList.add("settings-animation");
    settings.addEventListener("animationend", () => {
      settings.classList.remove("settings-animation");
    });
  }

  function handleDocumentClick(event) {
    const placeholder = document.getElementById("placeholder");
  
    if (
      !settings.contains(event.target) &&
      (!placeholder || !placeholder.contains(event.target))
    ) {
      settings.classList.remove("gear-active");
    }
  }

  settings.addEventListener("click", handleClick);
  settings.addEventListener("touchstart", handleClick);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("touchstart", handleDocumentClick);