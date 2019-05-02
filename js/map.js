let mymap = L.map('map', {
  maxBounds: [
    [60.0943, 24.7841],
    [60.3383, 25.2403],
  ],
  center: [60.171, 24.9415],
  zoom: 15,
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  minZoom: 12,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(mymap);

let loc = [60.171, 24.9415],  // Alkusijainti (rautatieasema)
    dest = [],
    placeMarkers = L.layerGroup().addTo(mymap),
    searchCircles = L.layerGroup().addTo(mymap),
    routeGroup = L.layerGroup().addTo(mymap),
    previousQueries = {}, // Tähän tallennetaan viimeisimmät hakuehdot tyypeittäin
    previousResults = {}, // Tähän tallennetaan viimeisimmät hakutulokset tyypeittäin
    tags = {},
    typeColors = {
      'places': 'blue',
      'events': 'red',
      'activities': 'purple',
    },
    locIcon = L.icon({  // Sijaintimerkin ikoni
      iconUrl: 'images/loc-icon.png',
      iconSize: [16, 16],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7],
    }),
    locMarker = L.marker(loc, {  // Sijaintimerkki
      icon: locIcon,
    }).addTo(mymap),
    destIcon = L.icon({  // Määränpäämerkin ikoni
      iconUrl: 'images/marker-icon-red.png',
      iconAnchor: [12, 39],
      popupAnchor: [0, -7],
    }),
    destMarker = L.marker(loc, {  // Määränpäämerkki
      icon: destIcon,
    });
locMarker.bindPopup('hmm Terve kaikille jotka tätä channelii kuuntelee! =p');

function search() {
  let searchType = 'places',
      radius = slider.value,
      searchString = loc.toString() + ',' + radius / 1000;
  
  if (previousQueries[searchType] === searchString) {
    console.log(searchString);
    addPlaceMarkers(searchType);
  } else {
    previousQueries[searchType] = searchString;
    
    // Korvataan vanha hakualue uudella
    searchCircles.clearLayers();
    L.circle(loc, {
      color: typeColors[searchType],
      fillOpacity: .1,
      radius: radius,
    }).addTo(searchCircles);
    
    // Tehdään haku API:sta
    apiRequest(searchString, searchType);
  }
}

function apiRequest(searchString, type) {
  let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
      targetUrl = `http://open-api.myhelsinki.fi/v1/${type}/?distance_filter=`,
      request = proxyUrl + targetUrl + searchString;
  tags[type] = {};  // Tehdään tämä muualla, kun implementoidaan haku reitin varrelta
  
  console.log(request);
  fetch(request).
      then(function(response) {
        return response.json();
      }).then(function(json) {
    console.log(json);
    // Lisätään löydetyt paikat mapiin, jotta reitin varrelta hakiessa vältytään duplikaateilta
    previousResults[type] = {};
    for (let i = 0; i < json.data.length; i++) {
      let places = previousResults[type],
          p = json.data[i],
          key = p.id;
      places[key] = p;
      // Tallennetaan löydettyjen paikkojen tagit
      for (let i = 0; i < p.tags.length; i++) {
        let id = p.tags[i].id;
        tags[type][id] = p.tags[i].name;
      }
    }
    // Korvataan edelliset paikkamerkit uusilla
    addPlaceMarkers(type);
  }).catch(function(virhe) {
    console.log(virhe);
  });
}

function addPlaceMarkers(type) {
  placeMarkers.clearLayers();
  let places = previousResults[type];
  
  for (let key in places) {
    if (places.hasOwnProperty(key)) {
      // Tänne tulee paikkojen suodatus
      let p = places[key],
          lat = p.location.lat,
          lon = p.location.lon,
          content = createPopupContent(p, type);
      L.marker([lat, lon]).addTo(placeMarkers).bindPopup(content);
    }
  }
}

function createPopupContent(place, type) {
  let address = place.location.address,
      streetAddr = (address.street_address) ? address.street_address : '',
      postalCode = (address.postal_code) ? address.postal_code : '',
      locality = (address.locality) ? address.locality : '',
      content = `<div id="popup-content" style="">
                 <h3><a href="${place.info_url}" target="_blank">${place.name.fi}</a></h3>
                 <p>${streetAddr}<br>
                  ${postalCode} ${locality}</p>`;
  
  switch (type) {
    case 'places':
      break;
      
    case 'activities':
      break;
      
    case 'events':
      break;
  }
  
  content += `<p>${place.description.body}</p>`;
  content += '</div>';
  return content;
}

// Karttaklikkaus
const contextPopup = L.popup().
    setContent(`<div id="setLoc" style="color: dodgerblue">Aseta sijainti</div><br>
                <div id="setDest" style="color: dodgerblue">Aseta määränpää</div>`);

mymap.on('contextmenu', (e) => {
  contextPopup.setLatLng(e.latlng).addTo(mymap).openOn(mymap);
  let setLoc = document.getElementById('setLoc');
  setLoc.addEventListener('click', function() {
    loc = [e.latlng.lat, e.latlng.lng];
    locMarker.setLatLng(e.latlng);
    inputLocation.value = loc;
    mymap.closePopup(contextPopup);
  });
  let setDest = document.getElementById('setDest');
  setDest.addEventListener('click', function() {
    dest = [e.latlng.lat, e.latlng.lng];
    destMarker.setLatLng(e.latlng).addTo(mymap);
    inputDestination.value = dest;
    mymap.closePopup(contextPopup);
  });
});
