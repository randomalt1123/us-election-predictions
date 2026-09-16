/**
 * Per-district (and Senate) race data for map tooltips.
 *
 * Default encoding — plain object keyed by id, value is a 3-tuple:
 *   [democraticCandidate, republicanCandidate, projectedMargin]
 *
 *   projectedMargin = D−R points (positive = Dem lead). Use null if unknown.
 *
 * Example:
 *   DISTRICT_RACES["AZ-01"] = ["Amish Shah", "David Schweikert", -2.4];
 *
 * A nested object map beats a 3D array here: O(1) lookup by district id,
 * sparse (only fill seats you care about), and easy to edit by hand.
 *
 * Nonstandard races (R vs R, D vs D, independent, etc.) go in
 * DISTRICT_RACE_OVERRIDES via overrideDistrictRace() — see below.
 */

(function () {
  const PARTY_LABEL = {
    D: "D",
    R: "R",
    I: "I",
    G: "G",
    L: "L",
    O: "O",
  };

  /** @type {Record<string, [string|null, string|null, number|null]>} */
  const DISTRICT_RACES = {
    // "AZ-01": ["Dem Name", "Rep Name", -2.4],
  };

  /**
   * Override shape:
   * {
   *   candidates: [{ name: string, party: "D"|"R"|"I"|"G"|"L"|"O"|string }],
   *   margin: number|null   // optional; same D−R convention when meaningful
   * }
   */
  const DISTRICT_RACE_OVERRIDES = {
    // Two Republicans (jungle / runoff style):
    // "LA-01": {
    //   candidates: [
    //     { name: "Steve Scalise", party: "R" },
    //     { name: "Other Republican", party: "R" },
    //   ],
    //   margin: null,
    // },
    //
    // Dem vs Independent:
    // "AK-AL": {
    //   candidates: [
    //     { name: "Mary Peltola", party: "D" },
    //     { name: "Independent Candidate", party: "I" },
    //   ],
    //   margin: 3.0,
    // },
  };

  /** Senate races keyed by state postal code, same tuple / override rules. */
  const SENATE_RACES = {
    // "AZ": ["Dem Name", "Rep Name", 1.5],
  };

  const SENATE_RACE_OVERRIDES = {
    // "ME": {
    //   candidates: [
    //     { name: "Independent Incumbent", party: "I" },
    //     { name: "Republican Challenger", party: "R" },
    //   ],
    //   margin: 6.0,
    // },
  };

  function _padId(id) {
    if (!id) return id;
    id = String(id).toUpperCase();
    const dash = id.lastIndexOf("-");
    if (dash < 0) return id; // state code
    const state = id.slice(0, dash);
    const num = id.slice(dash + 1);
    if (num === "AL") return `${state}-AL`;
    if (/^\d+$/.test(num)) return `${state}-${num.padStart(2, "0")}`;
    return id;
  }

  function _isSenateId(id) {
    return /^[A-Z]{2}$/.test(id);
  }

  function _tablesFor(id) {
    return _isSenateId(id)
      ? { base: SENATE_RACES, overrides: SENATE_RACE_OVERRIDES }
      : { base: DISTRICT_RACES, overrides: DISTRICT_RACE_OVERRIDES };
  }

  function _fromTuple(row) {
    if (!row) {
      return { candidates: [], margin: null };
    }
    if (Array.isArray(row)) {
      const [dem, rep, margin] = row;
      const candidates = [];
      if (dem) candidates.push({ name: String(dem), party: "D" });
      if (rep) candidates.push({ name: String(rep), party: "R" });
      return {
        candidates,
        margin: margin == null || margin === "" ? null : Number(margin),
      };
    }
    // Object form also accepted: { dem, rep, margin } or { candidates, margin }
    if (Array.isArray(row.candidates)) {
      return {
        candidates: row.candidates.map((c) => ({
          name: String(c.name || ""),
          party: String(c.party || "O").toUpperCase(),
        })),
        margin: row.margin == null || row.margin === "" ? null : Number(row.margin),
      };
    }
    const candidates = [];
    if (row.dem) candidates.push({ name: String(row.dem), party: "D" });
    if (row.rep) candidates.push({ name: String(row.rep), party: "R" });
    return {
      candidates,
      margin: row.margin == null || row.margin === "" ? null : Number(row.margin),
    };
  }

  /**
   * Resolve race info for a district (e.g. "VA-07") or Senate state ("AZ").
   * Overrides always win over the default tuple table.
   */
  function getRace(id) {
    id = _padId(id);
    if (!id) {
      return { id: null, override: false, candidates: [], margin: null };
    }
    const { base, overrides } = _tablesFor(id);
    if (overrides[id]) {
      const n = _fromTuple(overrides[id]);
      return { id, override: true, candidates: n.candidates, margin: n.margin };
    }
    const n = _fromTuple(base[id]);
    return { id, override: false, candidates: n.candidates, margin: n.margin };
  }

  /** Set / update the default D-vs-R tuple for a seat. */
  function setDistrictRace(id, dem, rep, margin) {
    id = _padId(id);
    const { base } = _tablesFor(id);
    base[id] = [
      dem == null || dem === "" ? null : String(dem),
      rep == null || rep === "" ? null : String(rep),
      margin == null || margin === "" || !Number.isFinite(Number(margin))
        ? null
        : Number(margin),
    ];
    return getRace(id);
  }

  /**
   * Override a seat with an arbitrary candidate list.
   *
   * overrideDistrictRace("LA-01", {
   *   candidates: [
   *     { name: "A", party: "R" },
   *     { name: "B", party: "R" },
   *   ],
   *   margin: null,
   * });
   *
   * overrideDistrictRace("VT", {
   *   candidates: [
   *     { name: "Bernie Sanders", party: "I" },
   *     { name: "Republican", party: "R" },
   *   ],
   *   margin: 30,
   * });
   */
  function overrideDistrictRace(id, spec) {
    id = _padId(id);
    if (!spec || typeof spec !== "object") {
      throw new Error("overrideDistrictRace(id, spec) requires a spec object");
    }
    const { overrides } = _tablesFor(id);
    const candidates = Array.isArray(spec.candidates)
      ? spec.candidates.map((c) => ({
          name: String(c.name || ""),
          party: String(c.party || "O").toUpperCase(),
        }))
      : [];
    overrides[id] = {
      candidates,
      margin:
        spec.margin == null || spec.margin === "" || !Number.isFinite(Number(spec.margin))
          ? null
          : Number(spec.margin),
    };
    return getRace(id);
  }

  function clearDistrictRaceOverride(id) {
    id = _padId(id);
    const { overrides } = _tablesFor(id);
    delete overrides[id];
    return getRace(id);
  }

  function formatMargin(m) {
    if (m == null || m === "" || !Number.isFinite(Number(m))) return "—";
    m = Number(m);
    if (Math.abs(m) < 0.05) return "EVEN";
    const side = m > 0 ? "D" : "R";
    const abs = Math.abs(m);
    const text = abs >= 10 ? abs.toFixed(0) : abs.toFixed(1);
    return `${side}+${text}`;
  }

  function partyClass(party) {
    const p = String(party || "O").toUpperCase();
    if (p === "D" || p === "DEM" || p === "DEMOCRATIC") return "dem";
    if (p === "R" || p === "REP" || p === "REPUBLICAN" || p === "GOP") return "rep";
    if (p === "I" || p === "IND" || p === "INDEPENDENT") return "ind";
    return "other";
  }

  function partyBadge(party) {
    const p = String(party || "O").toUpperCase();
    if (PARTY_LABEL[p]) return PARTY_LABEL[p];
    if (p === "DEM" || p === "DEMOCRATIC") return "D";
    if (p === "REP" || p === "REPUBLICAN" || p === "GOP") return "R";
    if (p === "IND" || p === "INDEPENDENT") return "I";
    return p.slice(0, 1) || "?";
  }

  window.DISTRICT_RACES = DISTRICT_RACES;
  window.DISTRICT_RACE_OVERRIDES = DISTRICT_RACE_OVERRIDES;
  window.SENATE_RACES = SENATE_RACES;
  window.SENATE_RACE_OVERRIDES = SENATE_RACE_OVERRIDES;
  window.getRace = getRace;
  window.setDistrictRace = setDistrictRace;
  window.overrideDistrictRace = overrideDistrictRace;
  window.clearDistrictRaceOverride = clearDistrictRaceOverride;
  window.formatRaceMargin = formatMargin;
  window.racePartyClass = partyClass;
  window.racePartyBadge = partyBadge;
})();
