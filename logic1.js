// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
"T6YbdDixkOBWH_k9GbS8JQ");

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
"T6YbdDixkOBWH_k9GbS8JQ");

function createFeatures(earthquakeData) {
  
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    //Create the popups
    layer.bindPopup("<h1>" + feature.properties.place +"</h1><hr>"+"<h3>" + "Magnitude: " + feature.properties.mag+ 
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    
  }
  
  var coords = [];
  var magnitude = [];
  var magMarkers= [];
  
  L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      coords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]);
    }})
    
  L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      magnitude.push(feature.properties.mag);
    }})
  
  function getColor(d) {
    return d > 8 ? '#800026' :
            d > 7  ? '#BD0026' :
            d > 5  ? '#E31A1C' :
            d > 4  ? '#FC4E2A' :
            d > 3   ? '#FD8D3C' :
            d > 2   ? '#FEB24C' :
            d > 1   ? '#FED976' :
                      '#FFEDA0';
    }

  for (var i = 0; i < coords.length; i++) {
    // Setting the marker radius for the state by passing population into the markerSize function
    magMarkers.push(
      L.circle(coords[i], {
        stroke: false,
        fillOpacity: magnitude[i]/5,
        color: "black",
        fillColor: getColor(magnitude[i]),
        radius: magnitude[i] * 50000
      }).bindPopup("<h1>" + "Magnitude:  " + magnitude[i] +"</h1><hr>" + "<h2>" + "Coodrinates: " + coords[i] + "</h2>") 
    )};


  var circleLayer = L.layerGroup(magMarkers)
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, circleLayer);
}



//Create gradient colors for the size of the magnitudes

//Create locations for the seismic circles

//Make a layer

function createMap(earthquakes, circleLayer) {
    // Adding tile layer
  
    
    // Grabbing our GeoJSON data..
    d3.json(link, function(data) {
      // Creating a GeoJSON layer with the retrieved data
      L.geoJson(data).addTo(map);
    });
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
    
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Magnitude": circleLayer 
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37, -10
      ],
      zoom: 2,
      minZoom: 2,
      maxZoom:7,
      layers: [streetmap, earthquakes, circleLayer]
    });
    
    var link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

    // Our style object
    var mapStyle = {
    color: "black",
    fillColor: "pink",
    fillOpacity: 0.5,
    weight: 2
    };

    // Grabbing our GeoJSON data..
    d3.json(link, function(data) {
    // Creating a geoJSON layer with the retrieved data
    L.geoJson(data, {
      // Passing in our style object
      style: mapStyle
    }).addTo(myMap);
    });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
