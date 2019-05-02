const geolocationButton = document.getElementById('geolocationButton');
const inputLocation = document.getElementById('inputLocation');
const inputDestination = document.getElementById('inputDestination');
geolocationButton.addEventListener('click', getCurrentLocation);

function getCurrentLocation() {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition, showError);
  } else {
    prompt('Selain ei tue paikannusta');
  }

}

function getPosition(position) {
  inputLocation.value = position.coords.latitude + ', ' +
      position.coords.longitude;
}

function currentAddress(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').
      then(function(response) {
        return response.json();
      }).
      then(function(queryJson) {
        //console.log(queryJson);
        loc = [queryJson[0].lat, queryJson[0].lon];
        //console.log(loc + ' loc');
        locMarker.setLatLng(loc);
      }).
      catch(function(error) {
        console.log(error);
      });
}

function currentDestination(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').
      then(function(response) {
        return response.json();
      }).
      then(function(queryJson) {
        //console.log(queryJson);
        dest = [queryJson[0].lat, queryJson[0].lon];
        //console.log(dest + ' dest');
        destMarker.setLatLng(dest).addTo(mymap);
      }).
      catch(function(error) {
        console.log(error);
      });
}

//
let searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function() {
  // Tänne syötteiden tarkistus
  console.log(inputLocation.value);
  if (inputLocation.value !== '') {
    currentAddress(inputLocation);
  }
  console.log(inputDestination.value);
  if (inputDestination.value !== '') {
    currentDestination(inputDestination);
  } else mymap.removeLayer(destMarker); // mikäli määränpään syöte on tyhjä, poistetaan markeri kartalta
});

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert('Sijaintipalveluiden käyttö estetty.');
      break;
    case error.POSITION_UNAVAILABLE:
      alert('Sijaintitietoja ei saatavilla.');
      break;
    case error.TIMEOUT:
      alert('Sijaintitietojen pyyntö aikakatkaistu.');
      break;
    case error.UNKNOWN_ERROR:
      alert('Tunnistamaton virhe tapahtui.');
      break;
  }
}

// sivupalkin piilotus

const sidebarContent = document.getElementById('sidebar');
const hideSidebar = document.getElementById('sidebarHideButton');
hideSidebar.addEventListener('click', hideSidebarToggle);

function hideSidebarToggle() {
  console.log('sidebarHideButton pressed');

  const styles = getComputedStyle(document.documentElement);

  let sidebarWidthValue = styles.getPropertyValue('--sidebar-hideButton-width');

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

// tag -listan piilottaminen ja muu käsittely

const tagButton = document.getElementById('tagButton');
const tagList = document.getElementById('tagList');
tagButton.addEventListener('click', hideTagsToggle);

function hideTagsToggle() {

  if (tagList.style.display === 'block')
    tagList.style.display = 'none';
  else
    tagList.style.display = 'block';
}

function getTags() {
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

getTags();