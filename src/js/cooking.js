function updateGridIngredientWrapperPadding() {
  const gridIngredientWrapper = document.querySelector('.grid-ingredient-wrapper');
  const dishSelectors = [
    '.first-dish', '.second-dish', '.third-dish', '.fourth-dish', '.fifth-dish',
    '.sixth-dish', '.seventh-dish', '.eight-dish', '.nine-dish', '.tenth-dish',
    '.eleven-dish', '.twelve-dish',
  ];

  const hasVisibleDish = dishSelectors.some(selector => {
    const dish = document.querySelector(selector);
    return dish && dish.style.display !== 'none';
  });

  if (hasVisibleDish) {
    gridIngredientWrapper.style.paddingBottom = '1rem';
  } else {
    gridIngredientWrapper.style.paddingBottom = '';
  }
}

function updateContainerSwitchClass(hideClass, dishClass) {
  const hideElement = document.querySelector(hideClass);
  const dishElement = document.querySelector(dishClass);

  if (hideElement && dishElement) {
    const dishVisible = localStorage.getItem(`${dishClass.slice(1)}-visible`);

    if (dishVisible !== 'none') {
      hideElement.classList.add('container-switch');
    } else {
      hideElement.classList.remove('container-switch');
    }
  }
}

function addToggleListeners(hideClass, dishClass, collapseClass) {
  const hideElement = document.querySelector(hideClass);
  const dishElement = document.querySelector(dishClass);
  const collapseElement = document.querySelector(collapseClass);

  hideElement.addEventListener("click", () => {
    dishElement.style.display = dishElement.style.display === "none" ? "" : "none";
  
    // Store the visibility state in local storage
    localStorage.setItem(`${dishClass.slice(1)}-visible`, dishElement.style.display);
  
    // Update container-switch after storing the visibility state in local storage
    updateContainerSwitchClass(hideClass, dishClass);
    updateGridIngredientWrapperPadding();
  });

  collapseElement.addEventListener("click", () => {
    dishElement.style.display = "none";
    hideElement.classList.remove("container-switch");

    // Store the visibility state in local storage
    localStorage.setItem(`${dishClass.slice(1)}-visible`, dishElement.style.display);
    updateGridIngredientWrapperPadding();
  });
}

function restoreUserSelections() {
  const numberStrings = [
    '', 'first', 'second', 'third', 'fourth', 'fifth',
    'sixth', 'seventh', 'eight', 'nine', 'tenth',
    'eleven', 'twelve'
  ];

  for (let i = 1; i <= 12; i++) {
    const hideClass = `.hide-${numberStrings[i]}`;
    const dishClass = `.${numberStrings[i]}-dish`;

    const hideElement = document.querySelector(hideClass);
    const dishElement = document.querySelector(dishClass);

    if (dishElement) {
      const dishVisible = localStorage.getItem(`${dishClass.slice(1)}-visible`);

      if (dishVisible !== null) {
        dishElement.style.display = dishVisible;
        updateContainerSwitchClass(hideClass, dishClass);;
      }
    }
  
    if (hideElement && dishElement) {
      if (dishElement.style.display !== 'none') { // Update this line
        hideElement.classList.add('container-switch');
      } else {
        hideElement.classList.remove('container-switch');
      }
      updateGridIngredientWrapperPadding();
    }
  }

  const ingredientListItems = document.querySelectorAll(".ingredient-list li");
  ingredientListItems.forEach((item, index) => {
    const stroked = JSON.parse(
      localStorage.getItem(`ingredient-${index}-stroked`)
    );
    if (stroked !== null && stroked) {
      item.classList.add("stroked");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const ingredientListItems = document.querySelectorAll(".ingredient-list li");

  ingredientListItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      item.classList.toggle("stroked");

      // Store the 'stroked' state in local storage
      localStorage.setItem(
        `ingredient-${index}-stroked`,
        item.classList.contains("stroked")
      );
    });
  });

  // Restore user selections
  restoreUserSelections();
});

// Usage
addToggleListeners(".hide-first", ".first-dish", ".collapse-one");
addToggleListeners(".hide-second", ".second-dish", ".collapse-two");
addToggleListeners(".hide-third", ".third-dish", ".collapse-three");
addToggleListeners(".hide-fourth", ".fourth-dish", ".collapse-four");
addToggleListeners(".hide-fifth", ".fifth-dish", ".collapse-five");
addToggleListeners(".hide-sixth", ".sixth-dish", ".collapse-six");
addToggleListeners(".hide-seventh", ".seventh-dish", ".collapse-seven");
addToggleListeners(".hide-eight", ".eight-dish", ".collapse-eight");
addToggleListeners(".hide-nine", ".nine-dish", ".collapse-nine");
addToggleListeners(".hide-tenth", ".tenth-dish", ".collapse-ten");
addToggleListeners(".hide-eleven", ".eleven-dish", ".collapse-eleven");
addToggleListeners(".hide-twelve", ".twelve-dish", ".collapse-twelve");
