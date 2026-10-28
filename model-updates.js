/**
 * Model changelog shown in the Updates board (top-left).
 * Newest entries first. Fill in `note` with your explanation.
 *
 * rating keys: safe-d | likely-d | lean-d | tossup | lean-r | likely-r | safe-r
 */
window.MODEL_UPDATES = [
  {
    date: "2026-10-28",
    title: "",
    chamber: "governor",
    changes: [
      { race: "Vermont", from: "likely-r", to: "lean-r" },
      { race: "Alaska", from: "lean-d", to: "likely-d" },
    ],
    note: "Vermont's polling has tightened, with Phil Scott's approvals falling and Amanda Janoo gaining momentum. In Alaska, Sen. Lisa Murkowski's endorsement of Democrat JKT has shown that the race is very likely to be a pickup for Democrats.",
  },
  {
    date: "2026-10-28",
    title: "",
    chamber: "senate",
    changes: [
      { race: "South Carolina", from: "likely-r", to: "lean-r" },
      { race: "Texas", from: "lean-r", to: "lean-d" },
    ],
    note: "In South Carolina, recent reputable pollsters have shown a closer race than expected. Texas has had multiple recent polls showing Talarico maintaining his advantage, even into the last week of the race, with Paxton only having led in one poll this October.",
  },
];

(function () {
  const RATING_LABELS = {
    "safe-d": "Safe D",
    "likely-d": "Likely D",
    "lean-d": "Lean D",
    tossup: "Toss-up",
    "lean-r": "Lean R",
    "likely-r": "Likely R",
    "safe-r": "Safe R",
  };

  const CHAMBER_LABELS = {
    house: "House",
    senate: "Senate",
    governor: "Governors",
  };

  function ratingColor(key) {
    return (window.RATING_COLORS && window.RATING_COLORS[key]) || "#888";
  }

  function formatDate(iso) {
    const d = new Date(iso + "T12:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function chip(rating) {
    const el = document.createElement("span");
    el.className = "upd-chip";
    el.style.background = ratingColor(rating);
    el.textContent = RATING_LABELS[rating] || rating;
    return el;
  }

  function renderBoard(listEl) {
    listEl.replaceChildren();
    const updates = window.MODEL_UPDATES || [];
    if (!updates.length) {
      const empty = document.createElement("p");
      empty.className = "upd-empty";
      empty.textContent = "No updates yet.";
      listEl.appendChild(empty);
      return;
    }

    updates.forEach((u, idx) => {
      const card = document.createElement("article");
      card.className = "upd-card" + (idx === 0 ? " is-latest" : "");

      const head = document.createElement("div");
      head.className = "upd-card-head";

      const date = document.createElement("time");
      date.className = "upd-date";
      date.dateTime = u.date || "";
      date.textContent = formatDate(u.date || "");

      const chamber = document.createElement("span");
      chamber.className = "upd-chamber upd-chamber--" + (u.chamber || "house");
      chamber.textContent = CHAMBER_LABELS[u.chamber] || u.chamber || "Update";

      head.append(date, chamber);
      card.append(head);

      if (u.changes && u.changes.length) {
        const changes = document.createElement("ul");
        changes.className = "upd-changes";
        u.changes.forEach((c) => {
          const li = document.createElement("li");
          li.className = "upd-change";

          const race = document.createElement("span");
          race.className = "upd-race";
          race.textContent = c.race || "";

          const arrow = document.createElement("span");
          arrow.className = "upd-arrow";
          arrow.textContent = "→";

          li.append(race, chip(c.from), arrow, chip(c.to));
          changes.appendChild(li);
        });
        card.appendChild(changes);
      }

      const note = document.createElement("p");
      note.className = "upd-note" + (u.note && String(u.note).trim() ? "" : " is-placeholder");
      note.textContent =
        u.note && String(u.note).trim()
          ? String(u.note).trim()
          : "";
      card.appendChild(note);

      listEl.appendChild(card);
    });
  }

  function init() {
    const toggle = document.getElementById("updates-toggle");
    const board = document.getElementById("updates-board");
    const list = document.getElementById("updates-list");
    const closeBtn = document.getElementById("updates-close");
    if (!toggle || !board || !list) return;

    const badge = toggle.querySelector(".updates-badge");
    const n = (window.MODEL_UPDATES || []).length;
    if (badge) {
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }

    renderBoard(list);

    function setOpen(open) {
      board.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      board.setAttribute("aria-hidden", open ? "false" : "true");
    }

    toggle.addEventListener("click", () => {
      setOpen(!board.classList.contains("is-open"));
    });
    closeBtn?.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && board.classList.contains("is-open")) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
