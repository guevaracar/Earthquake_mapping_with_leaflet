// Store the endpoint queryUrl from USGS.gov
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
var query = d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
     createFeatures(data.features);
});

function markerSize(magnitude) {
    return magnitude * 50000;
}

function createFeatures(earthquakeData){
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    var coords = [];
    var magnitude = [];
    var magMarkers = [];

    L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            coords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]);
        }
    })
    L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            magnitude.push(feature.properties.mag);
        }
    })

    for (var i = 0; i < coords.length; i++) {
        magMarkers.push(
            L.circle(coords[i], {
                stroke: false,
                fillOpacity: magnitude[i]/3,
                color: "black",
                fillColor: "white",
                radius: magnitude[i] * 50000
            }).bindPopup("<h1>" + "Magnitude:  " + magnitude[i] +"</h1><hr>" + "<h2>" + "Coodrinates: " + coords[i] + "</h2>")
        )
    };
    console.log(magMarkers);
    var circleLayer = L.layerGroup(magMarkers);

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    createMap(earthquakes, circleLayer);
}




// var earthquakes = L.layerGroup(earthquakeMarkers);

function createMap(earthquakes, circleLayer) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZ3VldmFyYWNhciIsImEiOiJjamRoanlzcWUwY2h0MzNvNjQ0eGgweG5wIn0." +
    "0cgJfdGPH-CjZZ1kwcJQow");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZ3VldmFyYWNhciIsImEiOiJjamRoanlzcWUwY2h0MzNvNjQ0eGgweG5wIn0." +
    "0cgJfdGPH-CjZZ1kwcJQow");

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
            37, -20.
        ],
        zoom: 2,
        layers: [streetmap, circleLayer]
    });

    

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

