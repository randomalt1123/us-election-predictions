(function () {
  let _ratingsLoaded = false;
  let _ratingMap = null;

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
        _ratingsLoaded = true;
      });
  }

  function applySenateRatings() {
    const colors = window.RATING_COLORS;
    if (!colors || !_ratingMap) return;

    document.querySelectorAll("#senate-states path.senate-state").forEach(path => {
      const state = (path.dataset.state || "").toUpperCase();
      const rating = _ratingMap.get(state);
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
})();
