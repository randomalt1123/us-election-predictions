const map = L.map("map", {
  zoomSnap: 0.5,
  minZoom: 3
}).setView([37.8, -96], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const info = document.getElementById("info");

function updateInfo(props) {
  if (!props) {
    info.innerHTML = "Hover over a district";
    return;
  }

  info.innerHTML = `
    <b>${props.STATE_NAME}</b><br>
    District ${props.DISTRICT}
  `;
}

function style(feature) {
  return {
    weight: 0.6,
    color: "#333",
    fillColor: "#6baed6",
    fillOpacity: 0.6
  };
}

let geojsonLayer;

function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#000",
    fillOpacity: 0.9
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  updateInfo(layer.feature.properties);
}

function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
  updateInfo(null);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  });
}

fetch("https://raw.githubusercontent.com/civic-interconnect/civic-data-boundaries-us-cd118/main/data-out/national/cd118_us.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, { style, onEachFeature }).addTo(map);
  });


map.on("zoomend", () => {
  if (!geojsonLayer) return;

  const interactive = map.getZoom() >= 4;
  geojsonLayer.eachLayer(layer => {
    layer.options.interactive = interactive;
  });
});
