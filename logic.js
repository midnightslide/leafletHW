// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
// Then send the features of the response body to the createFeatures function
d3.json(queryUrl).then(data => {
  createFeatures(data.features) 
  var magData = data.features
});


// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function addPopups(feature, layer) {
  layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`)
}

function getValue(x) {
	return x > 7 ? "#800026" :
	       x > 6 ? "#BD0026" :
	       x > 5 ? "#E31A1C" :
	       x > 4 ? "#FC4E2A" :
	       x > 3 ? "#FD8D3C" :
	       x > 2 ? "#FEB24C" :
	       x > 1 ? "#FED976" :
		       "#FFEDA0";
}

function createFeatures(earthquakeData) {
var magMarkers = [];
earthquakeData.forEach(magnitude => {
    magMarkers.push(
      L.circle([magnitude.geometry.coordinates[1], magnitude.geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.35,
        color: "blue",
        fillColor: getValue(magnitude.properties.mag),
        radius: magnitude.properties.mag * 7000
      })
    )
  });

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
var earthquakesLayer = L.geoJSON(earthquakeData, {
  onEachFeature: addPopups
});

var magLayer = L.layerGroup(magMarkers);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakesLayer, magLayer);
}

function createMap(earthquakes, mags) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    Dark: darkmap,
    Street: streetmap
  };
  

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Magnitudes: mags
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [darkmap, mags]
  });

  // Legend
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend');
  labels = ['<span style="color: #fff;">Magnitude</span>'],
  categories = ['7','6','5','4','3', '2', '1'];

  for (var i = 0; i < categories.length; i++) {

          div.innerHTML += 
          labels.push(
              '<i class="circle" style="background:' + getValue(categories[i]) + '"></i> ' +
          '<span style="color: #fff;">' + (categories[i] ? categories[i] : '+') + '.0</span>');

      }
      div.innerHTML = labels.join('<br>');
  return div;
  };
  legend.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}
