/**
 * Per-district ratings: ids like VA-01, VT-AL.
 * Default map: uniform swing from HOUSE_2024_BASELINE (district-2024-baseline.js) —
 * enter generic ballot Dem % (two-party); all CDs shift by (poll − 2024 national).
 * Fallback arrays (SAFE_D, …) apply only if baseline is missing.
 */
const RATING_COLORS = {
  "safe-d": "rgb(28, 64, 140)",
  "likely-d": "rgb(87, 124, 204)",
  "lean-d": "rgb(138, 175, 255)",
  tossup: "rgb(232, 200, 77)",
  "lean-r": "rgb(255, 139, 152)",
  "likely-r": "rgb(255, 88, 101)",
  "safe-r": "rgb(191, 29, 41)",
};

const _NativeMap = globalThis.Map;

const SAFE_D = [
  "AL-07",
  "AZ-03",
  "AZ-07",
  "CA-02",
  "CA-04",
  "CA-06",
  "CA-07",
  "CA-08",
  "CA-10",
  "CA-11",
  "CA-12",
  "CA-14",
  "CA-15",
  "CA-16",
  "CA-17",
  "CA-18",
  "CA-19",
  "CA-24",
  "CA-28",
  "CA-29",
  "CA-30",
  "CA-31",
  "CA-32",
  "CA-33",
  "CA-35",
  "CA-36",
  "CA-37",
  "CA-38",
  "CA-42",
  "CA-43",
  "CA-44",
  "CA-46",
  "CA-50",
  "CA-51",
  "CA-52",
  "CO-01",
  "CO-02",
  "CO-06",
  "CT-01",
  "CT-02",
  "CT-03",
  "CT-04",
  "DE-AL",
  "FL-10",
  "FL-14",
  "FL-20",
  "FL-24",
  "GA-04",
  "GA-05",
  "GA-06",
  "GA-13",
  "HI-01",
  "HI-02",
  "IL-01",
  "IL-02",
  "IL-03",
  "IL-04",
  "IL-05",
  "IL-07",
  "IL-09",
  "IL-10",
  "IL-13",
  "IN-07",
  "KY-03",
  "LA-02",
  "LA-06",
  "MA-01",
  "MA-02",
  "MA-03",
  "MA-04",
  "MA-05",
  "MA-06",
  "MA-07",
  "MA-08",
  "MD-02",
  "MD-03",
  "MD-04",
  "MD-05",
  "MD-07",
  "MD-08",
  "ME-01",
  "MI-06",
  "MI-11",
  "MI-12",
  "MI-13",
  "MN-03",
  "MN-04",
  "MN-05",
  "MO-01",
  "MO-05",
  "MS-02",
  "NC-02",
  "NC-04",
  "NC-12",
  "NJ-01",
  "NJ-06",
  "NJ-08",
  "NJ-12",
  "NY-05",
  "NY-06",
  "NY-07",
  "NY-08",
  "NY-09",
  "NY-10",
  "NY-12",
  "NY-13",
  "NY-14",
  "NY-15",
  "NY-16",
  "NY-20",
  "NY-25",
  "OH-03",
  "OH-11",
  "OR-01",
  "OR-03",
  "PA-02",
  "PA-03",
  "PA-04",
  "PA-05",
  "RI-01",
  "RI-02",
  "SC-06",
  "TN-09",
  "TX-07",
  "TX-09",
  "TX-16",
  "TX-18",
  "TX-20",
  "TX-29",
  "TX-30",
  "TX-32",
  "TX-33",
  "TX-35",
  "TX-37",
  "VA-03",
  "VA-04",
  "VA-08",
  "VA-11",
  "VT-AL",
  "WA-01",
  "WA-02",
  "WA-07",
  "WA-09",
  "WA-10",
  "WI-02",
  "WI-04",
];

const LIKELY_D = [
  "AL-02",
  "CA-25",
  "CA-26",
  "CA-34",
  "CA-39",
  "CO-07",
  "FL-09",
  "FL-22",
  "FL-25",
  "GA-02",
  "IL-06",
  "IL-08",
  "IL-11",
  "IL-14",
  "IL-17",
  "IN-01",
  "KS-03",
  "MA-09",
  "MI-03",
  "MN-02",
  "NH-01",
  "NJ-03",
  "NJ-05",
  "NJ-11",
  "NM-01",
  "NM-03",
  "NV-04",
  "NY-18",
  "NY-22",
  "OH-01",
  "PA-06",
  "PA-12",
  "WA-06",
  "WA-08",
];

const LEAN_D = [
  "AZ-04",
  "CA-09",
  "CA-13",
  "CA-21",
  "CA-27",
  "CA-45",
  "CA-47",
  "CA-49",
  "CT-05",
  "FL-23",
  "MD-06",
  "ME-02",
  "MI-08",
  "NC-01",
  "NH-02",
  "NJ-09",
  "NJ-10",
  "NM-02",
  "NV-01",
  "NV-03",
  "NY-03",
  "NY-04",
  "NY-19",
  "NY-26",
  "OH-09",
  "OH-13",
  "OR-04",
  "OR-05",
  "OR-06",
  "PA-17",
  "TX-28",
  "TX-34",
  "VA-07",
  "VA-10",
  "WA-03",
];

const TOSSUP = [];

const LEAN_R = [
  "AK-AL",
  "AZ-01",
  "AZ-06",
  "CA-20",
  "CA-22",
  "CA-41",
  "CO-03",
  "CO-04",
  "CO-08",
  "IA-01",
  "IA-03",
  "MI-07",
  "MI-10",
  "MT-01",
  "NE-02",
  "NJ-07",
  "NY-01",
  "NY-17",
  "PA-07",
  "PA-08",
  "PA-10",
  "VA-02",
  "WA-04",
  "WI-03",
];

const LIKELY_R = [
  "AZ-02",
  "AZ-08",
  "CA-03",
  "CA-40",
  "CO-05",
  "FL-04",
  "FL-07",
  "FL-13",
  "FL-15",
  "MI-04",
  "MO-02",
  "NC-11",
  "NY-02",
  "OH-06",
  "OH-07",
  "OH-15",
  "PA-01",
  "TX-15",
  "VA-01",
  "VA-05",
  "WI-01",
  "WI-08",
];

const SAFE_R = [
  "AL-01",
  "AL-03",
  "AL-04",
  "AL-05",
  "AL-06",
  "AR-01",
  "AR-02",
  "AR-03",
  "AR-04",
  "AZ-05",
  "AZ-09",
  "CA-01",
  "CA-05",
  "CA-23",
  "CA-48",
  "FL-01",
  "FL-02",
  "FL-03",
  "FL-05",
  "FL-06",
  "FL-08",
  "FL-11",
  "FL-12",
  "FL-16",
  "FL-17",
  "FL-18",
  "FL-19",
  "FL-21",
  "FL-26",
  "FL-27",
  "FL-28",
  "GA-01",
  "GA-03",
  "GA-07",
  "GA-08",
  "GA-09",
  "GA-10",
  "GA-11",
  "GA-12",
  "GA-14",
  "IA-02",
  "IA-04",
  "ID-01",
  "ID-02",
  "IL-12",
  "IL-15",
  "IL-16",
  "IN-02",
  "IN-03",
  "IN-04",
  "IN-05",
  "IN-06",
  "IN-08",
  "IN-09",
  "KS-01",
  "KS-02",
  "KS-04",
  "KY-01",
  "KY-02",
  "KY-04",
  "KY-05",
  "KY-06",
  "LA-01",
  "LA-03",
  "LA-04",
  "LA-05",
  "MD-01",
  "MI-01",
  "MI-02",
  "MI-05",
  "MI-09",
  "MN-01",
  "MN-06",
  "MN-07",
  "MN-08",
  "MO-03",
  "MO-04",
  "MO-06",
  "MO-07",
  "MO-08",
  "MS-01",
  "MS-03",
  "MS-04",
  "MT-02",
  "NC-03",
  "NC-05",
  "NC-06",
  "NC-07",
  "NC-08",
  "NC-09",
  "NC-10",
  "NC-13",
  "NC-14",
  "ND-AL",
  "NE-01",
  "NE-03",
  "NJ-02",
  "NJ-04",
  "NV-02",
  "NY-11",
  "NY-21",
  "NY-23",
  "NY-24",
  "OH-02",
  "OH-04",
  "OH-05",
  "OH-08",
  "OH-10",
  "OH-12",
  "OH-14",
  "OK-01",
  "OK-02",
  "OK-03",
  "OK-04",
  "OK-05",
  "OR-02",
  "PA-09",
  "PA-11",
  "PA-13",
  "PA-14",
  "PA-15",
  "PA-16",
  "SC-01",
  "SC-02",
  "SC-03",
  "SC-04",
  "SC-05",
  "SC-07",
  "SD-AL",
  "TN-01",
  "TN-02",
  "TN-03",
  "TN-04",
  "TN-05",
  "TN-06",
  "TN-07",
  "TN-08",
  "TX-01",
  "TX-02",
  "TX-03",
  "TX-04",
  "TX-05",
  "TX-06",
  "TX-08",
  "TX-10",
  "TX-11",
  "TX-12",
  "TX-13",
  "TX-14",
  "TX-17",
  "TX-19",
  "TX-21",
  "TX-22",
  "TX-23",
  "TX-24",
  "TX-25",
  "TX-26",
  "TX-27",
  "TX-31",
  "TX-36",
  "TX-38",
  "UT-01",
  "UT-02",
  "UT-03",
  "UT-04",
  "VA-06",
  "VA-09",
  "WA-05",
  "WI-05",
  "WI-06",
  "WI-07",
  "WV-01",
  "WV-02",
  "WY-AL",
];

const STATE_TO_ABB = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

function displayLabelToCode(label) {
  const atLarge = label.match(/^(.+)'s At Large$/);
  if (atLarge) {
    const abbr = STATE_TO_ABB[atLarge[1]];
    return abbr ? `${abbr}-AL` : null;
  }
  const num = label.match(/^(.+)'s (\d+)(?:st|nd|rd|th)$/);
  if (num) {
    const abbr = STATE_TO_ABB[num[1]];
    if (!abbr) return null;
    const n = parseInt(num[2], 10);
    return `${abbr}-${String(n).padStart(2, "0")}`;
  }
  return null;
}

function labelFromPath(path) {
  const fromData = path.getAttribute("data-district-label");
  if (fromData) {
    return fromData.replace(/&#39;/g, "'");
  }
  let raw = path.getAttribute("onmouseenter") || path.getAttribute("onMouseEnter");
  if (!raw) return null;
  let m = raw.match(/setInfo\('([^']+)'\)/) || raw.match(/setInfo\("([^"]+)"\)/);
  if (!m) return null;
  return m[1].replace(/&#39;/g, "'");
}

function buildRatingByDistrictId() {
  const map = new _NativeMap();
  const apply = (ids, key) => {
    for (const id of ids) map.set(id, key);
  };
  apply(SAFE_D, "safe-d");
  apply(LIKELY_D, "likely-d");
  apply(LEAN_D, "lean-d");
  apply(TOSSUP, "tossup");
  apply(LEAN_R, "lean-r");
  apply(LIKELY_R, "likely-r");
  apply(SAFE_R, "safe-r");
  return map;
}

/** Convert two-party Dem % to D−R margin (for polling average compatibility). */
function marginFromDPct(dPct) {
  return 2 * dPct - 100;
}

function marginToRating(m) {
  if (m > 0) {
    if (m >= 15) return "safe-d";
    if (m >= 8) return "likely-d";
    return "lean-d";
  }
  if (m < 0) {
    const x = -m;
    if (x >= 15) return "safe-r";
    if (x >= 8) return "likely-r";
    return "lean-r";
  }
  return "tossup";
}

function setPathFillForRating(path, code, rating) {
  path.dataset.district = code;
  const color = RATING_COLORS[rating];
  if (!color) return;
  path.style.setProperty("fill", color, "important");
  path.setAttribute("fill", color);
}

/**
 * Uniform swing: projectedMargin = districtMargin + (inputMargin − nationalMargin).
 * inputMargin is the D−R margin the user enters (positive = D lead).
 */
function applyUniformSwingModel(inputMargin) {
  const b = window.HOUSE_2024_BASELINE;
  if (!b || !b.marginById) {
    applyDistrictRatingsFromArrays();
    return;
  }
  const m = Number(inputMargin);
  if (!Number.isFinite(m)) return;
  const shift = m - b.nationalMargin;
  document.querySelectorAll("#us-map path.district").forEach((path) => {
    const rawLabel = labelFromPath(path);
    if (!rawLabel) return;
    const code = displayLabelToCode(rawLabel);
    if (!code) return;
    const base = b.marginById[code];
    if (base === undefined) return;
    const projected = Math.max(-100, Math.min(100, base + shift));
    const rating = marginToRating(projected);
    setPathFillForRating(path, code, rating);
  });
}

function applyDistrictRatingsFromArrays() {
  const ratingById = buildRatingByDistrictId();
  document.querySelectorAll("#us-map path.district").forEach((path) => {
    const rawLabel = labelFromPath(path);
    if (!rawLabel) return;
    const code = displayLabelToCode(rawLabel);
    if (!code) return;
    const rating = ratingById.get(code) ?? "tossup";
    setPathFillForRating(path, code, rating);
  });
}

let _currentMode = "manual"; // "manual" | "swing"

function applyDistrictRatings() {
  if (_currentMode === "swing" && window.HOUSE_2024_BASELINE?.marginById) {
    const input = document.getElementById("swing-margin-input");
    const v = input ? parseFloat(String(input.value).replace(",", ".")) : NaN;
    const margin = Number.isFinite(v) ? v : window.HOUSE_2024_BASELINE.nationalMargin;
    applyUniformSwingModel(margin);
  } else {
    applyDistrictRatingsFromArrays();
  }
}

let _pollControlsWired = false;

function wirePollControls() {
  if (_pollControlsWired) return;
  const manualBtn = document.getElementById("mode-manual");
  const swingBtn = document.getElementById("mode-swing");
  const swingControls = document.getElementById("swing-controls");
  const input = document.getElementById("swing-margin-input");
  const applyBtn = document.getElementById("poll-apply");
  const resetBtn = document.getElementById("poll-reset");
  const useAvgBtn = document.getElementById("poll-use-avg");
  if (!manualBtn || !swingBtn) return;
  _pollControlsWired = true;

  const b = window.HOUSE_2024_BASELINE;
  if (input && b && !input.dataset.inited) {
    input.value = String(b.nationalMargin);
    input.dataset.inited = "1";
  }

  manualBtn.addEventListener("click", () => {
    _currentMode = "manual";
    manualBtn.classList.add("active");
    swingBtn.classList.remove("active");
    if (swingControls) swingControls.style.display = "none";
    applyDistrictRatingsFromArrays();
  });

  swingBtn.addEventListener("click", () => {
    _currentMode = "swing";
    swingBtn.classList.add("active");
    manualBtn.classList.remove("active");
    if (swingControls) swingControls.style.display = "";
    applyDistrictRatings();
  });

  if (applyBtn && input) {
    applyBtn.addEventListener("click", () => {
      const v = parseFloat(String(input.value).replace(",", "."));
      if (Number.isFinite(v)) {
        _currentMode = "swing";
        swingBtn.classList.add("active");
        manualBtn.classList.remove("active");
        if (swingControls) swingControls.style.display = "";
        applyUniformSwingModel(v);
      }
    });
  }

  if (resetBtn && input) {
    resetBtn.addEventListener("click", () => {
      if (!b) return;
      input.value = String(b.nationalMargin);
      applyUniformSwingModel(b.nationalMargin);
    });
  }

  if (useAvgBtn && input) {
    useAvgBtn.addEventListener("click", () => {
      const avg = window.POLL_AVERAGE?.getAvg();
      if (avg !== null && avg !== undefined) {
        const avgMargin = marginFromDPct(avg);
        input.value = avgMargin.toFixed(1);
        applyUniformSwingModel(avgMargin);
      }
    });
  }

  window.POLL_AVERAGE?.update();
}

function runDistrictRatingsWhenReady() {
  const run = () => {
    wirePollControls();
    applyDistrictRatings();
  };
  run();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  }
}

runDistrictRatingsWhenReady();
window.applyDistrictRatings = applyDistrictRatings;
window.applyUniformSwingModel = applyUniformSwingModel;
window.applyDistrictRatingsFromArrays = applyDistrictRatingsFromArrays;
