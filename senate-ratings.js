(function () {
  let _ratingsLoaded = false;
  let _ratingMap = null;
  let _notUpD = 0;
  let _notUpR = 0;

  function _loadRatings() {
    if (_ratingsLoaded) return Promise.resolve();
    return fetch("senateByRating.json")
      .then(r => r.json())
      .then(data => {
        _ratingMap = new Map();
        const tiers = [
          ["no-election", data.NO_ELECTION],
          ["safe-d", data.SAFE_D],
          ["likely-d", data.LIKELY_D],
          ["lean-d", data.LEAN_D],
          ["tossup", data.TOSSUP],
          ["lean-r", data.LEAN_R],
          ["likely-r", data.LIKELY_R],
          ["safe-r", data.SAFE_R],
        ];
        for (const [rating, ids] of tiers) {
          for (const id of ids || []) {
            _ratingMap.set(id.toUpperCase(), rating);
          }
        }
        _notUpD = data.NOT_UP_D || 0;
        _notUpR = data.NOT_UP_R || 0;
        _ratingsLoaded = true;
      });
  }

  function applySenateRatings() {
    const colors = window.RATING_COLORS;
    if (!colors || !_ratingMap) return;

    document.querySelectorAll("#senate-states path.senate-state").forEach(path => {
      const state = (path.dataset.state || "").toUpperCase();
      const rating = _ratingMap.get(state);
      path.dataset.rating = rating || "";
      if (rating === "no-election") {
        path.style.fill = "#d4d4d4";
        path.style.fillOpacity = "0.18";
      } else if (rating && colors[rating]) {
        path.style.fill = colors[rating];
        path.style.fillOpacity = "1";
      } else {
        path.style.fill = "#d4d4d4";
        path.style.fillOpacity = "1";
      }
    });
    queueMicrotask(() => window.updateSeatCounts?.());
  }

  function getSenateCounts() {
    const b = getSenateTierBreakdown();
    if (!b) return null;
    return {
      dem: b["not-up-d"] + b["safe-d"] + b["likely-d"] + b["lean-d"],
      rep: b["not-up-r"] + b["safe-r"] + b["likely-r"] + b["lean-r"],
      tossup: b.tossup,
    };
  }

  function getSenateTierBreakdown() {
    if (!_ratingMap) return null;
    const out = {
      "safe-d": 0,
      "likely-d": 0,
      "lean-d": 0,
      tossup: 0,
      "lean-r": 0,
      "likely-r": 0,
      "safe-r": 0,
    };
    _ratingMap.forEach(rating => {
      if (rating === "no-election") return;
      if (out[rating] !== undefined) out[rating]++;
    });
    return { ...out, "not-up-d": _notUpD, "not-up-r": _notUpR };
  }

  function init() {
    _loadRatings().then(() => applySenateRatings());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.applySenateRatings = applySenateRatings;
  window.getSenateCounts = getSenateCounts;
  window.getSenateTierBreakdown = getSenateTierBreakdown;
})();
