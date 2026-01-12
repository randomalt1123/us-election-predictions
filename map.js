const map = L.map("map", {
  zoomSnap: 0.5,
  minZoom: 3
}).setView([37.8, -96], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const info = document.getElementById("info");

function updateInfo(props) {
  info.innerHTML = props
    ? `<b>${props.STATE_NAME}</b><br>District ${props.DISTRICT}`
    : "Hover over a district";
}

function baseStyle(feature) {
  return {
    weight: 0.6,
    color: "#333",
    fillColor: "#6baed6",
    fillOpacity: 0.6
  };
}

let geojsonLayer;
let hoveredLayer = null;

function highlightFeature(e) {
  const layer = e.target;

  if (hoveredLayer && hoveredLayer !== layer) {
    hoveredLayer.setStyle(baseStyle(hoveredLayer.feature));
  }

  hoveredLayer = layer;

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
  if (hoveredLayer === e.target) {
    e.target.setStyle(baseStyle(e.target.feature));
    hoveredLayer = null;
    updateInfo(null);
  }
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
    geojsonLayer = L.geoJSON(data, {
      style: baseStyle,
      onEachFeature
    }).addTo(map);
  });

map.on("zoomend", () => {
  if (!geojsonLayer) return;

  const interactive = map.getZoom() >= 4;
  geojsonLayer.eachLayer(layer => {
    layer.options.interactive = interactive;

    // safety reset if zooming out
    if (!interactive && hoveredLayer === layer) {
      layer.setStyle(baseStyle(layer.feature));
      hoveredLayer = null;
      updateInfo(null);
    }
  });
});
