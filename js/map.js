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
    placeMarkers = L.layerGroup().addTo(mymap),
    searchCircles = L.layerGroup().addTo(mymap),
    previousQueries = {}, // Tähän tallennetaan viimeisimmät hakuehdot tyypeittäin
    previousResults = {}, // Tähän tallennetaan viimeisimmät hakutulokset tyypeittäin
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
    }).addTo(mymap);
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
  
  console.log(request);
  fetch(request).
      then(function(response) {
        return response.json();
      }).then(function(json) {
    console.log(json);
    previousResults[type] = json;
    // Korvataan edelliset paikkamerkit uusilla
    addPlaceMarkers(type);
  }).catch(function(virhe) {
    console.log(virhe);
  });
}

function addPlaceMarkers(type) {
  placeMarkers.clearLayers();
  let length = previousResults[type].data.length;
  
  for (let i = 0; i < length; i++) {
    // Tänne tulee paikkojen suodatus
    let p = previousResults[type].data[i],
        lat = p.location.lat,
        lon = p.location.lon,
        name = p.name.fi;
    L.marker([lat, lon]).addTo(placeMarkers).bindPopup(name);
  }
}

// Karttaklikkaus
mymap.on('click', onMapClick);

function onMapClick(e) {
  loc = [e.latlng.lat, e.latlng.lng]; // Vaihdetaan oma sijainti
  locMarker.setLatLng(e.latlng); // Siirretään sijaintimerkki
}

let address = document.getElementById('inputLocation');

function addressSearch(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&addressdetails=1').
      then(function(response) {
        return response.json();
      }).
      then(function(queryJson) {
        console.log(queryJson);
        loc = [queryJson[0].lat, queryJson[0].lon];
        locMarker.setLatLng(loc);
      }).
      catch(function(error) {
        console.log(error);
      });
}

//
let searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function() {
  addressSearch(address);
});