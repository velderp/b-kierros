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
          key = json.data[i].id;
      places[key] = json.data[i];
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
          name = p.name.fi;
      L.marker([lat, lon]).addTo(placeMarkers).bindPopup(name);
    }
  }
}

let address = document.getElementById('inputLocation');

function addressSearch(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value +
      '&format=json&polygon=1&addressdetails=1').
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

// Karttaklikkaus
let contextHtml = `<div id="setLoc" style="color: dodgerblue">Aseta sijainti</div><br>
                   <div id="setDest" style="color: dodgerblue">Aseta määränpää</div>`,
    contextPopup = L.popup().setContent(contextHtml);

mymap.on('contextmenu', (e) => {
  contextPopup.setLatLng(e.latlng).addTo(mymap).openOn(mymap);
  let setLoc = document.getElementById('setLoc');
  setLoc.addEventListener('click', function() {
    loc = [e.latlng.lat, e.latlng.lng];
    locMarker.setLatLng(e.latlng);
  });
  let setDest = document.getElementById('setDest');
  setDest.addEventListener('click', function() {
    dest = [e.latlng.lat, e.latlng.lng];
    destMarker.setLatLng(e.latlng).addTo(mymap);
  });
});