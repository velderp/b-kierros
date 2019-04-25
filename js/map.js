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
    radius = .1,  // Hakualueen säde
    locIcon = L.icon({  // Sijaintimerkin ikoni
      iconUrl: 'images/loc-icon.png',
      iconSize: [16, 16],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7],
    }),
    marker = L.marker(loc, {  // Sijaintimerkki
      icon: locIcon,
    }).addTo(mymap);
marker.bindPopup('hmm Terve kaikille jotka tätä channelii kuuntelee! =p');

function search(latlon) {
  let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
      targetUrl = 'http://open-api.myhelsinki.fi/v1/places/?distance_filter=',
      searchString = latlon.toString() + ',' + radius;
  console.log(proxyUrl + targetUrl + searchString);
  // Korvataan vanha hakualue uudella
  searchCircles.clearLayers();
  L.circle(latlon, {
    color: 'green',
    fillOpacity: .1,
    radius: radius * 1000,
  }).addTo(searchCircles);
  // Tehdään haku API:sta
  fetch(proxyUrl + targetUrl + latlon.toString() + ',' + radius).
      then(function(response) {
        return response.json();
      }).then(function(json) {
    console.log(json);
    // Korvataan edelliset paikkamerkit uusilla
    placeMarkers.clearLayers();
    for (let i = 0; i < json.data.length; i++) {
      let p = json.data[i],
          lat = p.location.lat,
          lon = p.location.lon,
          name = p.name.fi;
      L.marker([lat, lon]).addTo(placeMarkers).bindPopup(name);
    }
  }).catch(function(virhe) {
    console.log(virhe);
  });
}

// Karttaklikkaus
mymap.on('click', onMapClick);
function onMapClick(e) {
  loc = [e.latlng.lat, e.latlng.lng]; // Vaihdetaan oma sijainti
  marker.setLatLng(e.latlng); // Siirretään sijaintimerkki
}


let address = document.getElementById('inputLocation');
function addressSearch(address) {
  //console.log(address.value);
  fetch('https://nominatim.openstreetmap.org/search?q=' + address.value + '&format=json&polygon=1&addressdetails=1').
      then(function(response) {
        return response.json();
      }).
      then(function(queryJson) {
        console.log(queryJson);
        loc = [queryJson[0].lat, queryJson[0].lon];
        marker.setLatLng(loc);
      }).
      catch(function(error) {
        console.log(error);
      });

}

//
let hakunappi = document.getElementById('searchButton');
hakunappi.addEventListener('click', function() {
  addressSearch(address);
});