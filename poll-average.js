/**
 * poll-average.js
 * Reads window.GENERIC_POLLS, computes a weighted generic-ballot average,
 * and renders a mini SVG graph into #poll-graph.
 */

const POLL_HALF_LIFE_DAYS = 30;
const POLL_DEFAULT_SAMPLE = 800;
const GRAPH_BW_MS = 7 * 86400000;

function _pollTwoPartyD(poll) {
  const d = +poll.dem, r = +poll.rep;
  if (!isFinite(d) || !isFinite(r) || d + r <= 0) return null;
  return (d / (d + r)) * 100;
}

function _pollMs(poll) {
  return new Date(poll.date + "T12:00:00").getTime();
}

function computeWeightedAverage(polls) {
  if (!polls || polls.length === 0) return null;
  const latest = Math.max(...polls.map(p => _pollMs(p)).filter(isFinite));
  if (!isFinite(latest)) return null;
  let ws = 0, wvs = 0;
  for (const p of polls) {
    const tp = _pollTwoPartyD(p);
    if (tp === null) continue;
    const pMs = _pollMs(p);
    const z = (pMs - latest) / GRAPH_BW_MS;
    const w = Math.exp(-0.5 * z * z);
    ws += w;
    wvs += w * tp;
  }
  return ws > 0 ? wvs / ws : null;
}

function _gaussSmooth(pts, valFn, bwMs, N, minMs, msRange) {
  const curve = [];
  for (let i = 0; i <= N; i++) {
    const ms = minMs + (msRange * i) / N;
    let ws = 0, wvs = 0;
    for (const p of pts) {
      const z = (p.ms - ms) / bwMs;
      const w = Math.exp(-0.5 * z * z);
      ws += w;
      wvs += w * valFn(p);
    }
    curve.push({ ms, v: ws > 0 ? wvs / ws : 0 });
  }
  return curve;
}

let _graphTwoParty = false;

let _graphStartMs = 0;

function _renderGraph(polls, avg) {
  const container = document.getElementById("poll-graph");
  if (!container) return;

  const dark = document.body.classList.contains("dark-mode");
  const C = {
    bg:        dark ? "#1a1a1a" : "#f8f8f8",
    bgStroke:  dark ? "#333"    : "#ddd",
    gridLine:  dark ? "#2e2e2e" : "#eee",
    tick:      dark ? "#555"    : "#aaa",
    label:     dark ? "#999"    : "#666",
    dotStroke: dark ? "#1a1a1a" : "white",
    tooltip:   dark ? "#1e1e1e" : "white",
    ttBorder:  dark ? "#444"    : "#ccc",
    ttText:    dark ? "#e0e0e0" : "inherit",
    crosshair: dark ? "#aaa"    : "#555",
  };

  const W = Math.min(container.clientWidth || 600, 800) || 600;
  const H = Math.round(W * 0.42);
  const PL = 38, PR = 10, PT = 14, PB = 34;
  const pw = W - PL - PR, ph = H - PT - PB;

  const pts = polls
    .map(p => {
      const d = +p.dem, r = +p.rep;
      if (!isFinite(d) || !isFinite(r)) return null;
      if (_graphTwoParty && d + r > 0) {
        const t = d + r;
        return { ms: _pollMs(p), dem: (d / t) * 100, rep: (r / t) * 100, label: p.pollster || "" };
      }
      return { ms: _pollMs(p), dem: d, rep: r, label: p.pollster || "" };
    })
    .filter(p => p !== null && isFinite(p.ms) && (!_graphStartMs || p.ms >= _graphStartMs))
    .sort((a, b) => a.ms - b.ms);

  if (pts.length === 0) {
    container.innerHTML = '<p style="font-size:11px;color:#888;margin:4px 0">No poll data yet.</p>';
    return;
  }

  const minMs = pts[0].ms;
  const maxMs = pts.length > 1 ? pts[pts.length - 1].ms : minMs + 86400000;
  const msRange = maxMs - minMs || 86400000;

  const allVals = pts.flatMap(p => [p.dem, p.rep]);
  let yMin = Math.floor(Math.min(...allVals) - 2);
  let yMax = Math.ceil(Math.max(...allVals) + 2);
  const yRange = yMax - yMin;

  const xS = ms => PL + ((ms - minMs) / msRange) * pw;
  const yS = v => PT + (1 - (v - yMin) / yRange) * ph;

  const N = Math.max(100, Math.round(msRange / 86400000));
  const demCurve = _gaussSmooth(pts, p => p.dem, GRAPH_BW_MS, N, minMs, msRange);
  const repCurve = _gaussSmooth(pts, p => p.rep, GRAPH_BW_MS, N, minMs, msRange);

  const curvePath = (curve, color) => {
    const d = curve.map((c, i) => `${i === 0 ? "M" : "L"}${xS(c.ms).toFixed(1)},${yS(c.v).toFixed(1)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>`;
  };

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 2) yTicks.push(v);

  // Build month tick marks along x-axis
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const xMonthTicks = [];
  {
    const d0 = new Date(minMs);
    // start at the 1st of the month after minMs
    let cur = new Date(d0.getFullYear(), d0.getMonth() + 1, 1);
    while (cur.getTime() <= maxMs) {
      const ms = cur.getTime();
      const x = xS(ms);
      // only draw if it fits with a small margin from edges
      if (x > PL + 10 && x < PL + pw - 10) {
        xMonthTicks.push({ ms, x, label: MONTH_NAMES[cur.getMonth()] });
      }
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  }

  const FS = 9; // base font size for axis labels

  const staticParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="display:block;font-family:sans-serif">`,
    `<rect x="${PL}" y="${PT}" width="${pw}" height="${ph}" fill="${C.bg}" stroke="${C.bgStroke}" stroke-width="0.5"/>`,
    ...yTicks.map(v =>
      `<line x1="${PL - 4}" y1="${yS(v).toFixed(1)}" x2="${PL}" y2="${yS(v).toFixed(1)}" stroke="${C.tick}" stroke-width="1"/>` +
      `<line x1="${PL}" y1="${yS(v).toFixed(1)}" x2="${PL + pw}" y2="${yS(v).toFixed(1)}" stroke="${C.gridLine}" stroke-width="0.5"/>` +
      `<text x="${PL - 6}" y="${(yS(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="${FS}" fill="${C.label}">${v}%</text>`
    ),
    ...xMonthTicks.map(t =>
      `<line x1="${t.x.toFixed(1)}" y1="${PT + ph}" x2="${t.x.toFixed(1)}" y2="${PT + ph + 5}" stroke="${C.tick}" stroke-width="1"/>` +
      `<line x1="${t.x.toFixed(1)}" y1="${PT}" x2="${t.x.toFixed(1)}" y2="${PT + ph}" stroke="${C.gridLine}" stroke-width="0.4" stroke-dasharray="3,3"/>` +
      `<text x="${t.x.toFixed(1)}" y="${PT + ph + 17}" text-anchor="middle" font-size="${FS}" fill="${C.label}">${t.label}</text>`
    ),
    pts.length > 1 ? curvePath(demCurve, "#3949ab") : "",
    pts.length > 1 ? curvePath(repCurve, "#c62828") : "",
    `<path d="${pts.map(p => { const cx = xS(p.ms), cy = yS(p.dem); return `M${(cx-3).toFixed(1)} ${cy.toFixed(1)}a3 3 0 1 0 6 0a3 3 0 1 0-6 0`; }).join('')}" fill="#3949ab" opacity="0.3" stroke="${C.dotStroke}" stroke-width="0.6"/>`,
    `<path d="${pts.map(p => { const cx = xS(p.ms), cy = yS(p.rep); return `M${(cx-3).toFixed(1)} ${cy.toFixed(1)}a3 3 0 1 0 6 0a3 3 0 1 0-6 0`; }).join('')}" fill="#c62828" opacity="0.3" stroke="${C.dotStroke}" stroke-width="0.6"/>`,
    `<circle cx="${PL + pw - 54}" cy="${PT + 10}" r="4" fill="#3949ab"/>`,
    `<text x="${PL + pw - 46}" y="${PT + 14}" font-size="${FS + 1}" fill="#3949ab" font-weight="600">Dem</text>`,
    `<circle cx="${PL + pw - 22}" cy="${PT + 10}" r="4" fill="#c62828"/>`,
    `<text x="${PL + pw - 14}" y="${PT + 14}" font-size="${FS + 1}" fill="#c62828" font-weight="600">Rep</text>`,
    `</svg>`,
  ];
  const dpr = window.devicePixelRatio || 1;
  const tooltipHtml = `<div id="pg-tooltip" style="position:absolute;top:${PT - 4}px;left:0;display:none;pointer-events:none;background:${C.tooltip};border:1px solid ${C.ttBorder};color:${C.ttText};border-radius:6px;padding:6px 10px;font-size:12px;font-family:sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.18);white-space:nowrap;z-index:10;will-change:transform"><strong id="pg-tt-date"></strong><br><span id="pg-tt-d" style="color:#3949ab;font-weight:600"></span> – <span id="pg-tt-r" style="color:#c62828;font-weight:600"></span><br><span id="pg-tt-m" style="font-weight:600"></span></div>`;

  container.style.position = "relative";
  container.innerHTML = staticParts.join("") + `<canvas id="pg-overlay" width="${W*dpr}" height="${H*dpr}" style="position:absolute;top:0;left:0;width:${W}px;height:${H}px;cursor:crosshair"></canvas>` + tooltipHtml;

  const canvas = document.getElementById("pg-overlay");
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const tooltip = document.getElementById("pg-tooltip");
  const ttDate = document.getElementById("pg-tt-date");
  const ttD = document.getElementById("pg-tt-d");
  const ttR = document.getElementById("pg-tt-r");
  const ttM = document.getElementById("pg-tt-m");
  if (!canvas) return;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtFull = ms => {
    const dt = new Date(ms);
    return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  };

  function drawOverlay(mx, dVal, rVal) {
    ctx.clearRect(0, 0, W, H);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = C.crosshair;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, PT);
    ctx.lineTo(mx, PT + ph);
    ctx.stroke();
    ctx.setLineDash([]);
    [[yS(dVal), "#3949ab"], [yS(rVal), "#c62828"]].forEach(([cy, color]) => {
      ctx.beginPath();
      ctx.arc(mx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = C.dotStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  drawOverlay(-100, 0, 0);
  ctx.clearRect(0, 0, W, H);
  let _cachedRect = canvas.getBoundingClientRect();
  window.addEventListener("resize", () => { _cachedRect = canvas.getBoundingClientRect(); }, { passive: true });

  let _rafPending = false;
  canvas.addEventListener("mousemove", e => {
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(() => {
      _rafPending = false;
      const rect = _cachedRect || (_cachedRect = canvas.getBoundingClientRect());
      const mx = e.clientX - rect.left;
      const frac = (mx - PL) / pw;
      if (frac < 0 || frac > 1) return;
      const ms = minMs + frac * msRange;
      const idx = Math.round(frac * N);
      const dVal = demCurve[Math.min(idx, N)].v;
      const rVal = repCurve[Math.min(idx, N)].v;

      drawOverlay(mx, dVal, rVal);

      const mVal = dVal - rVal;
      const mSide = Math.abs(mVal) < 0.05 ? "EVEN" : (mVal > 0 ? "D" : "R") + "+" + Math.abs(mVal).toFixed(1);
      ttDate.textContent = fmtFull(ms);
      ttD.textContent = `D ${dVal.toFixed(1)}%`;
      ttR.textContent = `R ${rVal.toFixed(1)}%`;
      ttM.textContent = mSide;
      ttM.style.color = mVal >= 0 ? "#3949ab" : "#c62828";
      tooltip.style.display = "block";
      const tipX = mx + 10 + 180 > W ? mx - 190 : mx + 10;
      tooltip.style.transform = `translateX(${tipX}px)`;
    });
  });

  canvas.addEventListener("mouseleave", () => {
    ctx.clearRect(0, 0, W, H);
    tooltip.style.display = "none";
  });
}

function _gaussAt(polls, ms, valFn) {
  let ws = 0, wvs = 0;
  for (const p of polls) {
    const d = +p.dem, r = +p.rep;
    if (!isFinite(d) || !isFinite(r)) continue;
    const pMs = _pollMs(p);
    const z = (pMs - ms) / GRAPH_BW_MS;
    const w = Math.exp(-0.5 * z * z);
    ws += w;
    wvs += w * valFn(p);
  }
  return ws > 0 ? wvs / ws : null;
}

function computeWeightedRawAverages(polls) {
  if (!polls || polls.length === 0) return null;
  const latest = Math.max(...polls.map(p => _pollMs(p)).filter(isFinite));
  if (!isFinite(latest)) return null;
  const dem = _gaussAt(polls, latest, p => +p.dem);
  const rep = _gaussAt(polls, latest, p => +p.rep);
  if (dem === null || rep === null) return null;
  return { dem, rep };
}

function _marginHTML(d, r, sz) {
  const m = d - r;
  if (Math.abs(m) < 0.05) return `<span style="font-size:${sz}px;font-weight:700;color:#888">EVEN</span>`;
  const side = m > 0 ? "D" : "R";
  const col = m > 0 ? "#3949ab" : "#c62828";
  return `<span style="font-size:${sz}px;font-weight:700;color:${col}">${side}+${Math.abs(m).toFixed(1)}</span>`;
}

function _formatAvgHTML(rawAvg, fontSize) {
  const sz = fontSize || 18;
  const smSz = Math.round(sz * 0.6);
  const mSz = Math.round(sz * 0.75);
  return `<span style="font-size:${sz}px;font-weight:700;color:#3949ab">${rawAvg.dem.toFixed(1)}%</span>` +
    `<span style="color:#555;font-size:${smSz}px;"> D</span>` +
    `<span style="color:#888;font-size:${smSz + 1}px;margin:0 4px;">–</span>` +
    `<span style="font-size:${sz}px;font-weight:700;color:#c62828">${rawAvg.rep.toFixed(1)}%</span>` +
    `<span style="color:#555;font-size:${smSz}px;"> R</span>` +
    `<span style="color:#888;font-size:${smSz}px;margin:0 6px;">(</span>` +
    _marginHTML(rawAvg.dem, rawAvg.rep, mSz) +
    `<span style="color:#888;font-size:${smSz}px;">)</span>`;
}

function updatePollPanel() {
  const polls = window.GENERIC_POLLS || [];
  const avg = computeWeightedAverage(polls);
  const rawAvg = computeWeightedRawAverages(polls);

  // mini hero widget on main map page
  const demEl  = document.getElementById("mw-dem");
  const repEl  = document.getElementById("mw-rep");
  const undEl  = document.getElementById("mw-und");
  const mgnEl  = document.getElementById("mw-margin");
  const undSeg = document.getElementById("mw-und-seg");
  const undDiv = document.getElementById("mw-und-div");
  if (demEl && rawAvg !== null) {
    const d = rawAvg.dem, r = rawAvg.rep;
    const und = Math.max(0, 100 - d - r);
    demEl.textContent = d.toFixed(1) + "%";
    repEl.textContent = r.toFixed(1) + "%";
    undEl.textContent = und.toFixed(1) + "%";
    const m = d - r;
    mgnEl.textContent = Math.abs(m) < 0.05 ? "EVEN"
      : (m > 0 ? "D" : "R") + "+" + Math.abs(m).toFixed(1);
    // hide undecided segment when in two-party mode
    if (undSeg) undSeg.style.display = _graphTwoParty ? "none" : "";
    if (undDiv) undDiv.style.display = _graphTwoParty ? "none" : "";
  }

  const graphContainer = document.getElementById("poll-graph");
  if (graphContainer) _renderGraph(polls, avg);

  return avg;
}

function setTwoPartyMode(on) {
  _graphTwoParty = !!on;
}

window.POLL_AVERAGE = {
  compute: computeWeightedAverage,
  computeRaw: computeWeightedRawAverages,
  formatHTML: _formatAvgHTML,
  update: updatePollPanel,
  getAvg: () => computeWeightedAverage(window.GENERIC_POLLS || []),
  setTwoParty: setTwoPartyMode,
  isTwoParty: () => _graphTwoParty,
  setStartMs: ms => { _graphStartMs = ms; },
};
