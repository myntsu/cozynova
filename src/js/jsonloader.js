// Create a shadow DOM to hold the card container
const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

// Create a card container element
const cardContainer = document.createElement('div');
cardContainer.classList.add('card-container');
shadowRoot.appendChild(cardContainer);

// Load the JSON data from the file
fetch('../mob-info.json')
  .then(response => response.json())
  .then(data => {
    // Create a map of ID -> data for easier lookup
    const mobData = new Map(data.map(mob => [mob.id, mob]));

    // Add a mouseover event listener to each paragraph element with a matching data-mob-card attribute
    document.querySelectorAll('[data-mob-card]').forEach(paragraph => {
      const mobId = Number(paragraph.getAttribute('data-mob-card'));
      const mob = mobData.get(mobId);
      if (mob) {
        let card;

        paragraph.addEventListener('mousemove', event => {
          // Create a new card element if it doesn't exist
          if (!card) {
            card = document.createElement('div');
            card.classList.add('mob-card');

            // Create a div container for the image and details
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('card-content');
            contentContainer.style.display = 'flex';
            contentContainer.style.justifyContent = 'space-between';

            const imgContainer = document.createElement('div');
            imgContainer.style.flex = '1 0 50%';
            imgContainer.style.display = 'grid';
            imgContainer.style.placeContent = 'center';
            contentContainer.appendChild(imgContainer);

            const textContainer = document.createElement('div');
            // textContainer.style.flex = '1 0 50%';
            textContainer.style.display = 'grid';
            textContainer.style.placeContent = 'center';
            contentContainer.appendChild(textContainer);

            // Create a heading element with the monster's name
            const name = document.createElement('h2');
            name.textContent = mob.name;
            name.classList.add('header');
            name.style.textAlign = 'center';
            card.appendChild(name);

            // Create an image element
            const image = document.createElement('img');
            const jsonImage = (mob) => {
              if (mob.novaImg && mob.novaImg.trim() !== "") {
                return mob.novaImg;
              } else {
                return `https://static.divine-pride.net/images/mobs/png/${mob.id}.png`;
              }
            };
            image.src = jsonImage(mob);
            image.alt = mob.name;
            image.style.maxWidth = '150px';
            image.style.height = 'auto';
            image.style.position = 'relative';
            imgContainer.appendChild(image);

            card.appendChild(contentContainer);

            // Create a paragraph element with the monster's level, HP, size, race, and element
            const details = document.createElement('p');
            details.innerHTML = `<span class="header">Level:</span> ${mob.level}<br>
                                <span class="header">HP:</span> ${mob.hp}<br>
                                <span class="header">Size:</span> ${mob.size} <br>
                                <span class="header">Race:</span> ${mob.race}<br>
                                <span class="header">Element:</span> ${mob.element}`;
            details.style.flex = 'flex';
            details.style.whiteSpace = 'nowrap';
            details.style.margin = '0';
            textContainer.appendChild(details);

            // Append the card to the card container
            cardContainer.appendChild(card);
            }

          // Set the position of the card relative to the mouse cursor
          card.style.position = 'absolute';
          card.style.backgroundColor = 'hsl(var(--main-dark), 70%)';
          card.style.color = 'hsl(var(--white))';
          card.style.padding = '.5rem';
          card.style.borderRadius = ".5rem";
          card.style.minWidth = '300px'
          card.style.top = `${event.clientY + window.scrollY + 10}px`;
          card.style.left = `${event.clientX + window.scrollX + 10}px`;
        });

        // Add a mouseout event listener to remove the card when the mouse leaves the paragraph element
        paragraph.addEventListener('mouseout', () => {
          if (card && card.parentNode) {
            card.parentNode.removeChild(card);
            card = null;
          }
        });
      }
    });
  });

// Append the shadow DOM to the document body
document.body.appendChild(shadowRoot);