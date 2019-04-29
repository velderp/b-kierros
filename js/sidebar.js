const sidebarContent = document.getElementById('sidebar');
const hideSidebar = document.getElementById('sidebarHideButton');
hideSidebar.addEventListener('click', hideSidebarToggle);

const tagButton = document.getElementById('tagButton');
const tagList = document.getElementById('tagList');
tagButton.addEventListener('click', hideTagsToggle);

function hideSidebarToggle() {
  console.log('sidebarHideButton pressed');

  const mapView = document.getElementById('map');

  const styles = getComputedStyle(document.documentElement);

  let sidebarWidthValue = styles.getPropertyValue('--sidebar-hideButton-width');
  console.log('value' + sidebarWidthValue);

  if (sidebarContent.style.display === 'block') {

    sidebarContent.style.display = 'none';
    hideSidebar.innerHTML = '>>';
    console.log('Sidebar hidden');
    hideSidebar.style.right = '-' + sidebarWidthValue.trim();

  } else {
    sidebarContent.style.display = 'block';
    console.log('Sidebar visible');
    hideSidebar.innerHTML = '<<';
    hideSidebar.style.right = '0';

  }

}

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