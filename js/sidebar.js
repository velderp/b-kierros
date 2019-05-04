'use strict';
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
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').then(function(response) {
    return response.json();
  }).then(function(queryJson) {
    console.log(queryJson[0]);
    loc = [queryJson[0].lat, queryJson[0].lon];
    locMarker.setLatLng(loc);
  }).catch(function(error) {
    console.log(error);
  });
}

let route;

function currentDestination(address) {
  console.log('currentDestination() with value ' + address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').then(function(response) {
    return response.json();
  }).then(function(queryJson) {
    dest = [queryJson[0].lat, queryJson[0].lon];
    destMarker.setLatLng(dest).addTo(mymap);

    if (!(route === undefined)) route.setWaypoints([]); // Poistetaan edellinen reitti
    route = L.Routing.control({
      waypoints: [
        loc,
        dest,
      ],
      router: L.Routing.mapbox(
          'pk.eyJ1IjoidmVsZGVycCIsImEiOiJjanVzOGlpcjMwY3puM3prM3Fyd2JmN3VyIn0.TkoFbaKL3EvCwGbvFbWYPA',
          {
            profile: 'mapbox/walking',
          }),
      createMarker: function() {
        return null;
      },
      show: false,
    });
    route.on('routeselected', function(e) {
      search(e.route.coordinates);
    });
    route.addTo(mymap);

  }).catch(function(error) {
    console.log(error);
  });
}

// hakunapin toiminnallisuus
let searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function() {
  // Tyhjennetään tag-lista
  const tagsToBeRemoved = document.getElementById('tagList');
  while (tagsToBeRemoved.firstChild) {
    tagsToBeRemoved.removeChild(tagsToBeRemoved.firstChild);
  }
  tagPlaceholder = [];

  // Syötteiden tarkistus
  if (inputLocation.value !== '') {
    currentAddress(inputLocation);
  }
  if (inputDestination.value !== '') {
    currentDestination(inputDestination);
  } else {
    mymap.removeLayer(destMarker);
    if (route !== undefined) route.setWaypoints([]);
    console.log('search()');
    search([loc]);
  }
  // mikäli määränpään syöte on tyhjä, poistetaan markeri ja reitti kartalta
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

  const styles = getComputedStyle(document.documentElement);

  let sidebarWidthValue = styles.getPropertyValue('--sidebar-hideButton-width');

  if (sidebarContent.style.display === 'block') {

    sidebarContent.style.display = 'none';
    hideSidebar.innerHTML = '>>';
    hideSidebar.style.right = '-' + sidebarWidthValue.trim();

  } else {
    sidebarContent.style.display = 'block';
    hideSidebar.innerHTML = '<<';
    hideSidebar.style.right = '0';

  }

}

// listan piilottaminen
const tagListWrapper = document.getElementById('tagList-wrapper');
const tagButton = document.getElementById('tagButton');
const tagList = document.getElementById('tagList');
tagButton.addEventListener('click', hideTagsToggle);

function hideTagsToggle() {

  if (tagListWrapper.style.display === 'block')
    tagListWrapper.style.display = 'none';
  else
    tagListWrapper.style.display = 'block';
}

// tag -listan luonti
let tagPlaceholder = [];

function getTags() {
  let type = document.querySelector('input[name="types"]:checked').id;
  for (let key in tags[type]) {
    if (tags[type].hasOwnProperty(key)) {
      let tag = tags[type][key];
      if (!tagPlaceholder.includes(tag)) {
        const taqlistItem = document.createElement('li');
        const tagLabel = document.createElement('label');
        const tagCheckbox = document.createElement('input');

        tagCheckbox.type = 'checkbox';
        tagCheckbox.name = 'tags';
        tagCheckbox.id = key;
        tagCheckbox.checked = true;

        tagLabel.setAttribute('for', key);
        tagLabel.innerText = tag; // innerTextiin APIlta saatu tieto suodattimista!

        taqlistItem.appendChild(tagCheckbox);
        taqlistItem.appendChild(tagLabel);
        tagList.appendChild(taqlistItem);

        tagPlaceholder.push(tag);

        document.getElementById(key).
            addEventListener('change', addPlaceMarkers);
      }
    }
  }
  sortTagElements();
}

// valitse kaikki tagit
const selectAllTags = document.getElementById('selectAllTags');
selectAllTags.addEventListener('change', function() {
  const tags = document.querySelectorAll('input[name="tags"]');
  if (selectAllTags.checked === true) {
    for (let i = 0; i < tags.length; i++) {
      tags[i].checked = true;
    }
  } else {
    for (let i = 0; i < tags.length; i++) {
      tags[i].checked = false;
    }
  }

  addPlaceMarkers();
});

// Järjestää suodatinlistan aakkosjärjestykseen
function sortTagElements() {
  let tagList = document.getElementById('tagList'),
      listItems = tagList.getElementsByTagName('li'),
      itemsArray = [];
  for (let i = 0; i < listItems.length; i++) {
    itemsArray.push({
      item: listItems[i],
      text: listItems[i].querySelector('label').innerText,
    });
  }
  itemsArray.sort((a, b) => (a.text > b.text) ? 1 : -1);
  for (let i = 0; i < itemsArray.length; i++) {
    tagList.appendChild(itemsArray[i].item);
  }
}

//sivupalkin infot
const placesInfoList = document.getElementById('placesInfoList');

function createPlacesInfoContent(place) {

  const placesInfoListItem = document.createElement('li'),
      content = document.createElement('div');

  content.className = 'placesInfoContent';

  let address = place.location.address,
      streetAddr = (address.street_address) ? address.street_address : '',
      postalCode = (address.postal_code) ? address.postal_code : '',
      locality = (address.locality) ? address.locality : '';

  content.innerHTML = `<h3><a href="${place.info_url}" target="_blank">${place.name.fi}</a></h3>
                 <p>${streetAddr}
                 ${postalCode}
                 ${locality}</p>
                 <button id=${'infoButtonId' + place.id} class='sidebar-button'>Lisätietoa</button>
                 <p id=${'infoDescId' +
  place.id} style="display:none;">${place.description.body}</p>`;
  placesInfoListItem.appendChild(content);
  placesInfoList.appendChild(placesInfoListItem);

  let button = document.getElementById('infoButtonId' + place.id);
  button.myparam = place.id;
  button.addEventListener('click', showInfo);

}

function showInfo(evt) {
  let buttonId = evt.target.myparam;
  let info = document.getElementById('infoDescId' + buttonId);
  if (info.style.display === 'block')
    info.style.display = 'none';
  else
    info.style.display = 'block';
}

function clearPlacesInfoContent() {

  while (placesInfoList.firstChild) {
    placesInfoList.removeChild(placesInfoList.firstChild);
  }

}
