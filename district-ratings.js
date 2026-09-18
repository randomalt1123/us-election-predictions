/**
 * Per-district ratings derived from projected D−R margin:
 *   |m| < 0.05 → treated as D+0.1 (lean D; no toss-ups)
 *   0.05–4.9   → lean
 *   5–14.9     → likely
 *   15+        → safe
 *
 * Projection: 2024 baseline + 0.85×(generic ballot − 2024 national) + WAR.
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

let SAFE_D = [], LIKELY_D = [], LEAN_D = [], TOSSUP = [], LEAN_R = [], LIKELY_R = [], SAFE_R = [];

function _padDistrictId(id) {
  const dash = id.lastIndexOf("-");
  if (dash < 0) return id;
  const state = id.slice(0, dash);
  const num = id.slice(dash + 1);
  if (num === "AL") return `${state}-AL`;
  return `${state}-${num.padStart(2, "0")}`;
}

let _ratingsLoaded = false;

function _loadRatingsFromJSON() {
  return fetch("districtsByRating.json")
    .then(r => r.json())
    .then(data => {
      SAFE_D   = (data.SAFE_D   || []).map(_padDistrictId);
      LIKELY_D = (data.LIKELY_D || []).map(_padDistrictId);
      LEAN_D   = (data.LEAN_D   || []).map(_padDistrictId);
      TOSSUP   = (data.TOSSUP   || []).map(_padDistrictId);
      LEAN_R   = (data.LEAN_R   || []).map(_padDistrictId);
      LIKELY_R = (data.LIKELY_R || []).map(_padDistrictId);
      SAFE_R   = (data.SAFE_R   || []).map(_padDistrictId);
      _ratingsLoaded = true;
    })
    .catch(err => {
      console.error("Failed to load districtsByRating.json:", err);
    });
}

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
  let x = Number(m);
  if (!Number.isFinite(x) || Math.abs(x) < 0.05) x = 0.1; // EVEN → slight Dem lean
  const abs = Math.abs(x);
  if (x > 0) {
    if (abs >= 15) return "safe-d";
    if (abs >= 5) return "likely-d";
    return "lean-d";
  }
  if (abs >= 15) return "safe-r";
  if (abs >= 5) return "likely-r";
  return "lean-r";
}

function setPathFillForRating(path, code, rating, projectedMargin) {
  path.dataset.district = code;
  path.dataset.rating = rating;
  if (projectedMargin == null || !Number.isFinite(Number(projectedMargin))) {
    delete path.dataset.projectedMargin;
  } else {
    path.dataset.projectedMargin = String(Number(projectedMargin));
  }
  const color = RATING_COLORS[rating];
  if (!color) return;
  path.style.setProperty("fill", color, "important");
  path.setAttribute("fill", color);
}

/**
 * Uniform / projected swing:
 *   projected = 2024District + elasticity×(nationalMargin − 2024National) + WAR
 * Forecast elasticity defaults inside computeProjectedMargin (0.85).
 * Manual Shift mode passes elasticity = 1 (full entered swing).
 */
function applyUniformSwingModel(inputMargin, opts) {
  const b = window.HOUSE_2024_BASELINE;
  if (!b || !b.marginById) {
    applyDistrictRatingsFromArrays();
    return;
  }
  const m = Number(inputMargin);
  if (!Number.isFinite(m)) return;
  const elasticity =
    opts && opts.elasticity != null && Number.isFinite(Number(opts.elasticity))
      ? Number(opts.elasticity)
      : 1;
  document.querySelectorAll("#us-map path.district").forEach((path) => {
    const rawLabel = labelFromPath(path);
    if (!rawLabel) return;
    const code = displayLabelToCode(rawLabel);
    if (!code) return;
    const projected = window.computeProjectedMargin?.(code, {
      nationalMargin: m,
      elasticity,
    });
    if (projected == null || !Number.isFinite(Number(projected))) return;
    const rating = marginToRating(projected);
    setPathFillForRating(path, code, rating, projected);
  });
  queueMicrotask(() => window.updateSeatCounts?.());
}

/** Forecast mode: damped swing from the live generic-ballot average + WAR. */
function applyProjectedModel() {
  const b = window.HOUSE_2024_BASELINE;
  if (!b || !b.marginById) {
    applyDistrictRatingsFromArrays();
    return;
  }
  const avg = window.POLL_AVERAGE?.getAvg?.();
  const national =
    avg != null && Number.isFinite(Number(avg)) ? marginFromDPct(Number(avg)) : b.nationalMargin;
  applyUniformSwingModel(national, { elasticity: 0.85 });
}

function applyDistrictRatingsFromArrays() {
  const ratingById = buildRatingByDistrictId();
  document.querySelectorAll("#us-map path.district").forEach((path) => {
    const rawLabel = labelFromPath(path);
    if (!rawLabel) return;
    const code = displayLabelToCode(rawLabel);
    if (!code) return;
    const rating = ratingById.get(code) ?? "tossup";
    const raceMargin = window.computeProjectedMargin?.(code) ?? window.getRace?.(code)?.margin;
    setPathFillForRating(path, code, rating, raceMargin);
  });
}

let _currentMode = "manual"; // "manual" | "swing"

function applyDistrictRatings() {
  if (_currentMode === "swing" && window.HOUSE_2024_BASELINE?.marginById) {
    const input = document.getElementById("swing-margin-input");
    const v = input ? parseFloat(String(input.value).replace(",", ".")) : NaN;
    const margin = Number.isFinite(v) ? v : window.HOUSE_2024_BASELINE.nationalMargin;
    applyUniformSwingModel(margin);
  } else if (window.HOUSE_2024_BASELINE?.marginById) {
    applyProjectedModel();
  } else {
    applyDistrictRatingsFromArrays();
  }
  queueMicrotask(() => window.updateSeatCounts?.());
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
    applyDistrictRatings();
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

  // Recompute Forecast when the generic-ballot average refreshes.
  if (window.POLL_AVERAGE && !window.POLL_AVERAGE._projectionHooked) {
    const prev = window.POLL_AVERAGE.update.bind(window.POLL_AVERAGE);
    window.POLL_AVERAGE.update = function (...args) {
      const result = prev(...args);
      if (_currentMode === "manual") applyDistrictRatings();
      return result;
    };
    window.POLL_AVERAGE._projectionHooked = true;
  }
}

function runDistrictRatingsWhenReady() {
  const run = () => {
    wirePollControls();
    applyDistrictRatings();
  };
  // Prefer projected margins; JSON ratings are only a fallback if baseline is missing.
  const init = () => {
    const p = window.HOUSE_2024_BASELINE?.marginById
      ? Promise.resolve()
      : _loadRatingsFromJSON();
    return Promise.resolve(p).then(run);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

runDistrictRatingsWhenReady();
window.RATING_COLORS = RATING_COLORS;
window.applyDistrictRatings = applyDistrictRatings;
window.applyUniformSwingModel = applyUniformSwingModel;
window.applyProjectedModel = applyProjectedModel;
window.applyDistrictRatingsFromArrays = applyDistrictRatingsFromArrays;
window.displayLabelToCode = displayLabelToCode;
window.labelFromPath = labelFromPath;
