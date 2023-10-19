// Create a Leaflet map
//need to find out the currenlt location of the user and then use those coordinate
const map = L.map('my-map').setView([48.1500327, 11.5753989], 10);
// Marker to save the position of found address
let marker;

const myAPIKey = "ae8fb1509dd84506babaa78221bde1bc";

// Retina displays require different mat tiles quality
const isRetina = L.Browser.retina;
const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
const retinaUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

// add Geoapify attribution
map.attributionControl.setPrefix('Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>')

// Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
L.tileLayer(isRetina ? retinaUrl : baseUrl, {
  attribution: '<a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  apiKey: myAPIKey,
  maxZoom: 20,
  id: 'osm-bright',
}).addTo(map);

// move zoom controls to bottom right
map.zoomControl.remove();
L.control.zoom({
  position: 'bottomright'
}).addTo(map);
// var address
function geocodeAddress() {
  const address = document.getElementById("address").value;
  if (!address || address.length < 3) {
    document.getElementById("status").textContent = "The address string is too short. Enter at least three symbols";
    return;
  }

	if (marker) {
  	marker.remove();
  }	

  const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${myAPIKey}`;

  // call Geocoding API - https://www.geoapify.com/geocoding-api
  fetch(geocodingUrl).then(result => result.json())
    .then(featureCollection => {
      if (featureCollection.features.length === 0) {
        document.getElementById("status").textContent = "The address is not found";
        return;
      }

      const foundAddress = featureCollection.features[0];
      getWeather(foundAddress) 
      getPetfriendlyplace(foundAddress.geometry.coordinates[1], foundAddress.geometry.coordinates[0]);

      document.getElementById("status").textContent = `Found address: ${foundAddress.properties.formatted}`;

	  marker = L.marker(new L.LatLng(foundAddress.properties.lat, foundAddress.properties.lon)).addTo(map);
	  map.panTo(new L.LatLng(foundAddress.properties.lat, foundAddress.properties.lon));
    });

  addAddressToRecent(document.getElementById('address').value); //delete me
}

function getPetfriendlyplace(lat, long){

  fetch(`https://api.geoapify.com/v2/places?categories=pet&filter=circle:${long},${lat},5000&limit=20&apiKey=ae8fb1509dd84506babaa78221bde1bc`)
    .then(response => response.json())
    .then(result => {console.log(result)

    
      for (var i = 0; i<result.features.length; i++){
        marker = L.marker(new L.LatLng(result.features[i].properties.lat, result.features[i].properties.lon), {title:result.features[i].properties.name}).addTo(map)


        var name = result.features[i].properties.name;
        var address = result.features[i].properties.address_line2;
        var googleMapsLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);

        var popupContent = name + "<br><a href='" + googleMapsLink + "' target='_blank'>" + address + "</a>";

        marker.bindPopup(popupContent);

      };
    })
    .catch(error => console.log('error', error));

};

function getWeather(foundAddress) {
  // var apiKey = '3aff5737440b30c8e962f8a23c414db4';
  // var cityName = 'Minneapolis'
  // var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${address}&appid=${apiKey}`
  // // api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

  // fetch(requestUrl)
  //     .then(function (response) {
  //         return response.json();
  //     })
  //     .then(function (data) {
  //         console.log(data)
  //         //Loop over the data to generate a table, each table row will have a link to the repo url
  //         for (var i = 0; i < data.length; i++) {
  //             // Creating elements, tablerow, tabledata, and anchor
  //             var createTableRow = document.createElement('tr');
  //             var tableData = document.createElement('td');
  //             var link = document.createElement('a');

  //             // Setting the text of link and the href of the link
  //             link.textContent = data[i].html_url;
  //             link.href = data[i].html_url;

  //             tableData.appendChild(link);
  //             createTableRow.appendChild(tableData);
  //             tableBodyWeather.appendChild(createTableRow);
  //         }
  //     });
}


function addAddressToRecent(address) {
  // Retrieve the recent addresses from localStorage
  let recentAddresses = JSON.parse(localStorage.getItem('recentAddresses')) || [];

  // Add the new address to the beginning
  recentAddresses.unshift(address);

  // Limit to 5 recent addresses and save back to localStorage
  recentAddresses = recentAddresses.slice(0, 5);
  localStorage.setItem('recentAddresses', JSON.stringify(recentAddresses));

  displayRecentAddresses();
}

function displayRecentAddresses() {
  const recentList = document.getElementById('recent-list');
  const recentAddresses = JSON.parse(localStorage.getItem('recentAddresses')) || [];
  
  // Clear any existing list
  recentList.innerHTML = '';

  // Populate the list with recent addresses
  recentAddresses.forEach(address => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = address;
      a.href = "#";
      a.onclick = function() {
          document.getElementById('address').value = address;
          geocodeAddress();
      }
      li.appendChild(a);
      recentList.appendChild(li);
  });
}

// Call the function when the page loads to display any saved addresses
displayRecentAddresses();
