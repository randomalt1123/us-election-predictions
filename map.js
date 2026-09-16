const tip = document.getElementById("map-tooltip");
const tipName = document.getElementById("map-tip-name");
const tipMargin = document.getElementById("map-tip-margin");
const tipCandidates = document.getElementById("map-tip-candidates");
const container = document.getElementById("map-container");
const svg = document.getElementById("us-map");

const MAP_W = 800;
const MAP_H = 501;
const MIN_VB_W = 35;
const MAX_VB_W = MAP_W * 8;
const ZOOM_STEP = 0.92;
const PAN_MARGIN = 2500;
const TIP_OFFSET_X = 14;
const TIP_OFFSET_Y = 16;

const STATE_ABB_TO_NAME = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia",
};

let tipVisible = false;
let mouseX = 0;
let mouseY = 0;

function decodeLabel(raw) {
  if (!raw) return "";
  return String(raw).replace(/&#39;/g, "'");
}

function nameFromPath(path) {
  if (!path) return "";
  const districtLabel = path.getAttribute("data-district-label");
  if (districtLabel) return decodeLabel(districtLabel);
  const state = (path.dataset.state || "").toUpperCase();
  if (state && STATE_ABB_TO_NAME[state]) return STATE_ABB_TO_NAME[state];
  const enter = path.getAttribute("onmouseenter") || path.getAttribute("onMouseEnter") || "";
  const m = enter.match(/setInfo\('((?:\\'|[^'])*)'\)/) || enter.match(/setInfo\("((?:\\"|[^"])*)"\)/);
  if (m) return decodeLabel(m[1].replace(/\\'/g, "'").replace(/\\"/g, '"'));
  return "";
}

function raceIdFromPath(path) {
  if (!path) return null;
  if (path.classList.contains("senate-state")) {
    return (path.dataset.state || "").toUpperCase() || null;
  }
  if (path.dataset.district) return path.dataset.district;
  const label = nameFromPath(path);
  if (label && window.displayLabelToCode) {
    return window.displayLabelToCode(label);
  }
  return null;
}

function positionTip(clientX, clientY) {
  if (!tip || !tipVisible) return;
  const pad = 8;
  tip.style.left = "0px";
  tip.style.top = "0px";
  const rect = tip.getBoundingClientRect();
  let x = clientX + TIP_OFFSET_X;
  let y = clientY + TIP_OFFSET_Y;
  if (x + rect.width > window.innerWidth - pad) {
    x = clientX - rect.width - TIP_OFFSET_X;
  }
  if (y + rect.height > window.innerHeight - pad) {
    y = clientY - rect.height - TIP_OFFSET_Y;
  }
  x = Math.max(pad, x);
  y = Math.max(pad, y);
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

function renderCandidates(candidates) {
  if (!tipCandidates) return;
  tipCandidates.replaceChildren();
  if (!candidates || !candidates.length) {
    const empty = document.createElement("div");
    empty.className = "map-tip-empty";
    empty.textContent = "No candidates set";
    tipCandidates.appendChild(empty);
    return;
  }
  for (const c of candidates) {
    const row = document.createElement("div");
    const party = c.party || "O";
    row.className = `map-tip-cand ${window.racePartyClass?.(party) || "other"}`;
    const badge = document.createElement("span");
    badge.className = "map-tip-party";
    badge.textContent = window.racePartyBadge?.(party) || "?";
    const name = document.createElement("span");
    name.className = "map-tip-cand-name";
    name.textContent = c.name || "—";
    row.append(badge, name);
    tipCandidates.appendChild(row);
  }
}

function showTip(name, path) {
  if (!tip || !name) {
    hideTip();
    return;
  }
  tipName.textContent = name;

  const id = raceIdFromPath(path);
  const race = (id && window.getRace?.(id)) || { candidates: [], margin: null };

  let margin = race.margin;
  const live = path?.dataset?.projectedMargin;
  if (live != null && live !== "" && Number.isFinite(Number(live))) {
    margin = Number(live);
  }
  tipMargin.textContent = window.formatRaceMargin?.(margin) ?? "—";
  renderCandidates(race.candidates);

  tip.classList.add("is-visible");
  tip.setAttribute("aria-hidden", "false");
  tipVisible = true;
  positionTip(mouseX, mouseY);
}

function hideTip() {
  if (!tip) return;
  tip.classList.remove("is-visible");
  tip.setAttribute("aria-hidden", "true");
  tipVisible = false;
}

function setInfo(name) {
  if (!name) {
    hideTip();
    return;
  }
  // Inline onmouseenter handlers don't pass the path; mouseover handler does.
  showTip(decodeLabel(name), null);
}

window.setInfo = setInfo;

function viewHeight() {
  return (vbW * MAP_H) / MAP_W;
}

let vbX = 0;
let vbY = 0;
let vbW = MAP_W;

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
  hideTip();
});

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (tipVisible && !dragging) positionTip(mouseX, mouseY);
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

svg.addEventListener("mouseover", (e) => {
  if (dragging) return;
  const path = e.target.closest?.("path.district, path.senate-state");
  if (!path || !svg.contains(path)) return;
  const name = nameFromPath(path);
  if (name) showTip(name, path);
});

svg.addEventListener("mouseout", (e) => {
  const path = e.target.closest?.("path.district, path.senate-state");
  if (!path) return;
  const next = e.relatedTarget?.closest?.("path.district, path.senate-state");
  if (next && svg.contains(next)) return;
  hideTip();
});
