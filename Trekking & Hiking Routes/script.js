// ===============================
// FREE MAP + PLACE SEARCH SYSTEM WITH IMAGES
// ===============================

let map = L.map('map').setView([20.5937, 78.9629], 5); // Default India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

// Function to get an image from Unsplash
async function getImage(placeName) {
  try {
    const res = await fetch(`https://source.unsplash.com/300x200/?${encodeURIComponent(placeName)},nature`);
    return res.url; // returns the URL of a random image related to the place
  } catch {
    return 'default-image.jpg'; // fallback image
  }
}

// Function to show places with images
async function showPlaces(places) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  markersLayer.clearLayers();

  if (places.length === 0) {
    results.innerHTML = 'No nearby trekking places found.';
    return;
  }

  for (let place of places) {
    const imageUrl = await getImage(place.name);

    const div = document.createElement('div');
    div.className = "result-card";
    div.innerHTML = `
      <img src="${imageUrl}" alt="${place.name}" />
      <h3>${place.name}</h3>
      <p>Address: ${place.address}</p>
      <a href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=14/${place.lat}/${place.lon}" target="_blank">
        Open in Map
      </a>
    `;
    results.appendChild(div);

    const marker = L.marker([place.lat, place.lon]).addTo(markersLayer);
    marker.bindPopup(`<b>${place.name}</b><br>${place.address}`);
  }
}

// Find nearby trails
async function findTrails(lat, lon) {
  map.setView([lat, lon], 13);

  const overpassUrl = `
    https://overpass-api.de/api/interpreter?data=
    [out:json];
    (
      node(around:15000,${lat},${lon})[leisure=park][name];
      node(around:15000,${lat},${lon})[tourism=attraction][name];
      node(around:15000,${lat},${lon})[tourism=trailhead][name];
    );
    out;
  `;

  const res = await fetch(overpassUrl);
  const data = await res.json();

  let places = data.elements.map(e => ({
    name: e.tags.name,
    address: e.tags['addr:full'] || e.tags['addr:city'] || 'Address not available',
    lat: e.lat,
    lon: e.lon
  }));

  // Remove duplicates
  const uniquePlaces = [];
  const seen = new Set();
  places.forEach(p => {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      uniquePlaces.push(p);
    }
  });

  showPlaces(uniquePlaces);
}

// Autocomplete search
const input = document.getElementById('place-search');
const resultBox = document.createElement('ul');
resultBox.className = 'autocomplete-box';
input.parentNode.appendChild(resultBox);

input.addEventListener('input', async () => {
  const query = input.value.trim();
  if (query.length < 2) {
    resultBox.innerHTML = '';
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5`;
  const response = await fetch(url);
  const data = await response.json();

  resultBox.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.display_name;
    li.addEventListener('click', () => {
      input.value = item.display_name;
      resultBox.innerHTML = '';
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      findTrails(lat, lon);
    });
    resultBox.appendChild(li);
  });
});

// Explore nearby button
document.getElementById('explore-btn').onclick = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      findTrails(pos.coords.latitude, pos.coords.longitude);
    }, () => alert('Location access denied.'));
  } else {
    alert('Geolocation is not supported.');
  }
};

// Manual search button
document.getElementById('search-btn').onclick = async function() {
  const query = input.value.trim();
  if (!query) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    findTrails(lat, lon);
  } else {
    alert('Place not found.');
  }
};
