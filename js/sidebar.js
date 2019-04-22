const suodatusButton = document.getElementById('suodatusButton');
const suodattimetContent = document.getElementById('suodattimetContent');

suodatusButton.addEventListener('click', suodattimetToggle);

function suodattimetToggle() {
  if (suodattimetContent.style.display === 'block')
    suodattimetContent.style.display = 'none';
  else
    suodattimetContent.style.display = 'block';
}

function haeSuodattimet() {
  for (let i = 0; i < 5; i++) {
    const suodatinListItem = document.createElement('li');
    const suodatinLabel = document.createElement('label');
    const suodatinCheckbox = document.createElement('input');
    suodatinCheckbox.type = 'checkbox';
    suodatinCheckbox.id = 'suodatin' + i;
    suodatinLabel.innerText = 'Suodatin #' + i; // innerTextiin APIlta saatu tieto suodattimista!
    suodatinLabel.appendChild(suodatinCheckbox);
    suodatinListItem.appendChild(suodatinLabel);
    suodattimetContent.appendChild(suodatinListItem);
  }
}

haeSuodattimet();