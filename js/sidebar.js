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
      '&format=json&polygon=1&addressdetails=1').then(function(response) {
    return response.json();
  }).then(function(queryJson) {
    //console.log(queryJson);
    loc = [queryJson[0].lat, queryJson[0].lon];
    //console.log(loc + ' loc');
    locMarker.setLatLng(loc);
  }).catch(function(error) {
    console.log(error);
  });
}

let route;

function currentDestination(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').then(function(response) {
    return response.json();
  }).then(function(queryJson) {
    //console.log(queryJson);
    dest = [queryJson[0].lat, queryJson[0].lon];
    //console.log(dest + ' dest');
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
  let tagCounter = 0;
  while (tagsToBeRemoved.firstChild) {
    tagsToBeRemoved.removeChild(tagsToBeRemoved.firstChild);
    tagCounter++;
  }
  console.log(tagCounter + " tags removed from the list");
  tagPlaceholder = [];
  
  // Syötteiden tarkistus
  if (inputLocation.value !== '') {
    console.log('location: ' + inputLocation.value);
    currentAddress(inputLocation);
  } else console.log('no current location given');
  if (inputDestination.value !== '') {
    console.log('destination: ' + inputDestination.value);
    currentDestination(inputDestination);
  } else {
    console.log('no current destination given, searching only nearby current location..');
    mymap.removeLayer(destMarker);
    if (route !== undefined) route.setWaypoints([]);
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
  console.log('sidebarHideButton pressed');

  const styles = getComputedStyle(document.documentElement);

  let sidebarWidthValue = styles.getPropertyValue('--sidebar-hideButton-width');

  if (sidebarContent.style.display === 'block') {

    sidebarContent.style.display = 'none';
    hideSidebar.innerHTML = '>>';
    console.log('sidebar hidden');
    hideSidebar.style.right = '-' + sidebarWidthValue.trim();

  } else {
    sidebarContent.style.display = 'block';
    console.log('sidebar visible');
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
    
        tagLabel.setAttribute('for', tag);
        tagLabel.innerText = tag; // innerTextiin APIlta saatu tieto suodattimista!
    
        taqlistItem.appendChild(tagCheckbox);
        taqlistItem.appendChild(tagLabel);
        tagList.appendChild(taqlistItem);
    
        tagPlaceholder.push(tag);
    
        document.getElementById(key).addEventListener('change', addPlaceMarkers);
      }
    }
  }
}

// valitse kaikki tagit

const selectAllTags = document.getElementById('selectAllTags');
selectAllTags.addEventListener('change', function() {
  const tags = document.querySelectorAll('input[name="tags"]');
  if (selectAllTags.checked === true) {
    for (let element in tags) {
      tags[element].checked = true;
    }
  } else {
    for (let element in tags) {
      tags[element].checked = false;
    }
  }

  addPlaceMarkers();
  console.log(selectAllTags.checked)

});