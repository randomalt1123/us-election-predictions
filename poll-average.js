/**
 * poll-average.js
 * Reads window.GENERIC_POLLS, computes a weighted generic-ballot average,
 * and renders a mini SVG graph into #poll-graph.
 */

const POLL_HALF_LIFE_DAYS = 30;
const POLL_DEFAULT_SAMPLE = 800;
const GRAPH_BW_MS = 2.5 * 86400000;

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

function _renderGraph(polls, avg) {
  const container = document.getElementById("poll-graph");
  if (!container) return;

  const W = Math.min(container.clientWidth || 600, 800) || 600;
  const H = Math.round(W * 0.42);
  const PL = 30, PR = 8, PT = 10, PB = 24;
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
    .filter(p => p !== null && isFinite(p.ms))
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

  const N = 100;
  const demCurve = _gaussSmooth(pts, p => p.dem, GRAPH_BW_MS, N, minMs, msRange);
  const repCurve = _gaussSmooth(pts, p => p.rep, GRAPH_BW_MS, N, minMs, msRange);

  const curvePath = (curve, color) => {
    const d = curve.map((c, i) => `${i === 0 ? "M" : "L"}${xS(c.ms).toFixed(1)},${yS(c.v).toFixed(1)}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>`;
  };

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 2) yTicks.push(v);

  const fmtDate = ms => {
    const d = new Date(ms);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="display:block;overflow:visible">`,
    `<rect x="${PL}" y="${PT}" width="${pw}" height="${ph}" fill="#f8f8f8" stroke="#ddd" stroke-width="0.5"/>`,
    // Y ticks
    ...yTicks.map(v =>
      `<line x1="${PL - 3}" y1="${yS(v).toFixed(1)}" x2="${PL}" y2="${yS(v).toFixed(1)}" stroke="#aaa" stroke-width="0.75"/>` +
      `<line x1="${PL}" y1="${yS(v).toFixed(1)}" x2="${PL + pw}" y2="${yS(v).toFixed(1)}" stroke="#eee" stroke-width="0.4"/>` +
      `<text x="${PL - 5}" y="${(yS(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="7" fill="#666">${v}%</text>`
    ),
    // X labels
    `<text x="${xS(minMs).toFixed(1)}" y="${PT + ph + 14}" text-anchor="middle" font-size="7" fill="#666">${fmtDate(minMs)}</text>`,
    msRange > 2 * 86400000 ? `<text x="${xS(maxMs).toFixed(1)}" y="${PT + ph + 14}" text-anchor="middle" font-size="7" fill="#666">${fmtDate(maxMs)}</text>` : "",
    // Trend lines
    pts.length > 1 ? curvePath(demCurve, "#3949ab") : "",
    pts.length > 1 ? curvePath(repCurve, "#c62828") : "",
    // Dem dots (blue)
    ...pts.map(p =>
      `<circle cx="${xS(p.ms).toFixed(1)}" cy="${yS(p.dem).toFixed(1)}" r="3" fill="#3949ab" opacity="0.6" stroke="white" stroke-width="0.6"><title>${p.label ? p.label + ": " : ""}D ${p.dem}%</title></circle>`
    ),
    // Rep dots (red)
    ...pts.map(p =>
      `<circle cx="${xS(p.ms).toFixed(1)}" cy="${yS(p.rep).toFixed(1)}" r="3" fill="#c62828" opacity="0.6" stroke="white" stroke-width="0.6"><title>${p.label ? p.label + ": " : ""}R ${p.rep}%</title></circle>`
    ),
    // Legend
    `<circle cx="${PL + pw - 50}" cy="${PT + 8}" r="3" fill="#3949ab"/>`,
    `<text x="${PL + pw - 44}" y="${PT + 11}" font-size="8" fill="#3949ab">Dem</text>`,
    `<circle cx="${PL + pw - 22}" cy="${PT + 8}" r="3" fill="#c62828"/>`,
    `<text x="${PL + pw - 16}" y="${PT + 11}" font-size="8" fill="#c62828">Rep</text>`,
    // Hover elements (hidden by default)
    `<line id="pg-crosshair" x1="0" y1="${PT}" x2="0" y2="${PT + ph}" stroke="#555" stroke-width="0.75" stroke-dasharray="3,2" visibility="hidden"/>`,
    `<circle id="pg-dot-d" r="4" fill="#3949ab" stroke="white" stroke-width="1" visibility="hidden"/>`,
    `<circle id="pg-dot-r" r="4" fill="#c62828" stroke="white" stroke-width="1" visibility="hidden"/>`,
    `<rect id="pg-hover-zone" x="${PL}" y="${PT}" width="${pw}" height="${ph}" fill="transparent" style="cursor:crosshair"/>`,
    `</svg>`,
    `<div id="pg-tooltip" style="position:absolute;display:none;pointer-events:none;background:white;border:1px solid #ccc;border-radius:4px;padding:4px 8px;font-size:11px;font-family:sans-serif;box-shadow:0 1px 4px rgba(0,0,0,0.15);white-space:nowrap;z-index:10"></div>`,
  ];
  container.style.position = "relative";
  container.innerHTML = parts.join("");

  const svg = container.querySelector("svg");
  const hoverZone = document.getElementById("pg-hover-zone");
  const crosshair = document.getElementById("pg-crosshair");
  const dotD = document.getElementById("pg-dot-d");
  const dotR = document.getElementById("pg-dot-r");
  const tooltip = document.getElementById("pg-tooltip");
  if (!hoverZone || !svg) return;

  const fmtFull = ms => {
    const dt = new Date(ms);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  };

  hoverZone.addEventListener("mousemove", e => {
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const frac = (mx - PL) / pw;
    if (frac < 0 || frac > 1) return;
    const ms = minMs + frac * msRange;
    const idx = Math.round(frac * N);
    const dVal = demCurve[Math.min(idx, N)].v;
    const rVal = repCurve[Math.min(idx, N)].v;

    crosshair.setAttribute("x1", mx.toFixed(1));
    crosshair.setAttribute("x2", mx.toFixed(1));
    crosshair.setAttribute("visibility", "visible");
    dotD.setAttribute("cx", mx.toFixed(1));
    dotD.setAttribute("cy", yS(dVal).toFixed(1));
    dotD.setAttribute("visibility", "visible");
    dotR.setAttribute("cx", mx.toFixed(1));
    dotR.setAttribute("cy", yS(rVal).toFixed(1));
    dotR.setAttribute("visibility", "visible");

    const mVal = dVal - rVal;
    const mSide = Math.abs(mVal) < 0.05 ? "EVEN" : (mVal > 0 ? "D" : "R") + "+" + Math.abs(mVal).toFixed(1);
    const mCol = mVal >= 0 ? "#3949ab" : "#c62828";
    tooltip.style.display = "block";
    tooltip.innerHTML = `<strong>${fmtFull(ms)}</strong><br><span style="color:#3949ab;font-weight:600">D ${dVal.toFixed(1)}%</span> – <span style="color:#c62828;font-weight:600">R ${rVal.toFixed(1)}%</span><br><span style="color:${mCol};font-weight:600">${mSide}</span>`;
    const tipW = tooltip.offsetWidth;
    let tipX = mx + 10;
    if (tipX + tipW > W) tipX = mx - tipW - 10;
    tooltip.style.left = tipX + "px";
    tooltip.style.top = (PT - 4) + "px";
  });

  hoverZone.addEventListener("mouseleave", () => {
    crosshair.setAttribute("visibility", "hidden");
    dotD.setAttribute("visibility", "hidden");
    dotR.setAttribute("visibility", "hidden");
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

  const avgEl = document.getElementById("poll-avg-display");
  if (avgEl) {
    if (rawAvg !== null) {
      avgEl.innerHTML = _formatAvgHTML(rawAvg, 20);
    } else {
      avgEl.textContent = "No polls yet.";
    }
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
};
