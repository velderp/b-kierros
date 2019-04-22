const tagButton = document.getElementById('tagButton');
const tagList = document.getElementById('tagList');

tagButton.addEventListener('click', hideTagsToggle);

function hideTagsToggle() {
  if (tagList.style.display === 'block')
    tagList.style.display = 'none';
  else
    tagList.style.display = 'block';
}

function haeSuodattimet() {
  for (let i = 0; i < 5; i++) {
    const taqlistItem = document.createElement('li');
    const tagLabel = document.createElement('label');
    const tagCheckbox = document.createElement('input');

    tagCheckbox.type = 'checkbox';
    tagCheckbox.name = 'tags';
    tagCheckbox.id = 'suodatin' + i;

    tagLabel.setAttribute('for', 'suodatin' + i);
    tagLabel.innerText = 'Suodatin #' + i; // innerTextiin APIlta saatu tieto suodattimista!

    taqlistItem.appendChild(tagCheckbox);
    taqlistItem.appendChild(tagLabel);
    tagList.appendChild(taqlistItem);
  }
}

haeSuodattimet();