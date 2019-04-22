let mymap = L.map('map').setView([60.171, 24.9415], 15);
L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      minZoom: 12,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoidmVsZGVycCIsImEiOiJjanVzOGlpcjMwY3puM3prM3Fyd2JmN3VyIn0.TkoFbaKL3EvCwGbvFbWYPA',
    }).addTo(mymap);

mymap.setMaxBounds([
  [60.0943, 24.7841],
  [60.3383, 25.2403],
]);

let marker = L.marker([60.171, 24.9415]).addTo(mymap);
marker.bindPopup('hmm Terve kaikille jotka tätä channelii kuuntelee! =p').
    openPopup();
