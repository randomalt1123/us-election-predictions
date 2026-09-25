/**
 * Konami code (↑↑↓↓←→←→BA) toggles primary ↔ alternate prediction models
 * across House, Senate, and Governors.
 */
(function () {
  const SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  let _buf = [];
  let _alt = false;
  let _toastTimer = null;

  function _ensureToastStyles() {
    if (document.getElementById("model-toast-style")) return;
    const style = document.createElement("style");
    style.id = "model-toast-style";
    style.textContent = `
      #model-toast {
        position: fixed;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%) translateY(12px);
        z-index: 10000;
        padding: 10px 18px;
        border-radius: 8px;
        background: rgba(20, 20, 24, 0.92);
        color: #f2f2f2;
        font: 600 13px/1.3 system-ui, -apple-system, sans-serif;
        letter-spacing: 0.02em;
        box-shadow: 0 8px 28px rgba(0,0,0,0.35);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      #model-toast.is-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      body:not(.dark-mode) #model-toast {
        background: rgba(255,255,255,0.95);
        color: #1a1a1a;
        box-shadow: 0 8px 28px rgba(0,0,0,0.18);
      }
      .seat-label .model-badge {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 0.72em;
        font-weight: 700;
        letter-spacing: 0.06em;
        vertical-align: middle;
        background: #c9a227;
        color: #1a1400;
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(message) {
    _ensureToastStyles();
    let el = document.getElementById("model-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "model-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  function updateBadge() {
    const label = document.getElementById("seat-label");
    if (!label) return;
    let badge = label.querySelector(".model-badge");
    if (_alt) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "model-badge";
        badge.textContent = "ALT";
        label.appendChild(badge);
      }
    } else if (badge) {
      badge.remove();
    }
  }

  async function applyModel(which) {
    const tasks = [];
    if (typeof window.setHouseRatingModel === "function") {
      tasks.push(Promise.resolve(window.setHouseRatingModel(which)));
    }
    if (typeof window.setSenateRatingModel === "function") {
      tasks.push(Promise.resolve(window.setSenateRatingModel(which)));
    }
    if (typeof window.setGovernorRatingModel === "function") {
      tasks.push(Promise.resolve(window.setGovernorRatingModel(which)));
    }
    await Promise.all(tasks);
    window.updateSeatCounts?.();
    updateBadge();
    // Re-stamp badge after seat-label text refresh
    queueMicrotask(updateBadge);
    setTimeout(updateBadge, 120);
  }

  async function toggleModel() {
    _alt = !_alt;
    const which = _alt ? "alt" : "primary";
    showToast(_alt ? "Alternate model unlocked" : "Primary model restored");
    await applyModel(which);
  }

  function onKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) {
      _buf = [];
      return;
    }

    const key = e.code || e.key;
    const next = SEQUENCE[_buf.length];
    const matched =
      key === next ||
      (next === "KeyB" && (key === "b" || key === "B")) ||
      (next === "KeyA" && (key === "a" || key === "A"));

    if (matched) {
      _buf.push(SEQUENCE[_buf.length]);
      if (_buf.length === SEQUENCE.length) {
        _buf = [];
        e.preventDefault();
        toggleModel();
      }
    } else {
      // Allow restarting if this key is the first in the sequence
      _buf = key === SEQUENCE[0] ? [SEQUENCE[0]] : [];
    }
  }

  window.addEventListener("keydown", onKeyDown, true);

  window.getPredictionModel = () => (_alt ? "alt" : "primary");
  window.setPredictionModel = async (which) => {
    _alt = which === "alt";
    await applyModel(_alt ? "alt" : "primary");
    showToast(_alt ? "Alternate model unlocked" : "Primary model restored");
  };
  window.togglePredictionModel = toggleModel;
})();
