const info = document.getElementById("info");
const container = document.getElementById("map-container");
const svg = document.getElementById("us-map");

const MAP_W = 800;
const MAP_H = 501;
const MIN_VB_W = 35;
const MAX_VB_W = MAP_W * 8;
const ZOOM_STEP = 0.92;
const PAN_MARGIN = 2500;

function setInfo(name) {
  info.textContent = name || "Hover over a district";
}

let vbX = 0;
let vbY = 0;
let vbW = MAP_W;

function viewHeight() {
  return (vbW * MAP_H) / MAP_W;
}

function clampViewBox() {
  vbW = Math.min(MAX_VB_W, Math.max(MIN_VB_W, vbW));
  const h = viewHeight();
  const vbXMin = MAP_W - vbW - PAN_MARGIN;
  const vbXMax = PAN_MARGIN;
  const vbYMin = MAP_H - h - PAN_MARGIN;
  const vbYMax = PAN_MARGIN;
  vbX = Math.min(vbXMax, Math.max(vbXMin, vbX));
  vbY = Math.min(vbYMax, Math.max(vbYMin, vbY));
  svg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${h}`);
}

function svgPointFromClient(clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const u = (clientX - rect.left) / rect.width;
  const v = (clientY - rect.top) / rect.height;
  const h = viewHeight();
  return {
    u,
    v,
    focusX: vbX + u * vbW,
    focusY: vbY + v * h,
  };
}

container.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const { u, v, focusX, focusY } = svgPointFromClient(e.clientX, e.clientY);
    const mult = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
    let newW = vbW * mult;
    newW = Math.min(MAX_VB_W, Math.max(MIN_VB_W, newW));
    const newH = (newW * MAP_H) / MAP_W;
    vbX = focusX - u * newW;
    vbY = focusY - v * newH;
    vbW = newW;
    clampViewBox();
  },
  { passive: false }
);

let dragging = false;
let lastX = 0;
let lastY = 0;

container.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  container.classList.add("is-panning");
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const rect = svg.getBoundingClientRect();
  const h = viewHeight();
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  vbX -= (dx / rect.width) * vbW;
  vbY -= (dy / rect.height) * h;
  lastX = e.clientX;
  lastY = e.clientY;
  clampViewBox();
});

window.addEventListener("mouseup", () => {
  if (!dragging) return;
  dragging = false;
  container.classList.remove("is-panning");
});
