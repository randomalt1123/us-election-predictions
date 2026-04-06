const fs = require("fs");
const data = require("./YapmsMap.json");

const SAFE_D = [];
const LIKELY_D = [];
const LEAN_D = [];

const LEAN_R = [];
const LIKELY_R = [];
const SAFE_R = [];

const formatDistrict = id => {
  const s = id.toString();
  const dash = s.lastIndexOf("-");
  if (dash < 0) return s;
  const state = s.slice(0, dash);
  const num = s.slice(dash + 1);
  if (num === "AL") return `${state}-AL`;
  return `${state}-${num.padStart(2, "0")}`;
};

data.regions.forEach(region => {
  const result = region.candidates[0];
  if (!result) return;

  const party = result.id;      // "0" = D, "1" = R
  const margin = result.margin; // 0,1,2,...

  const districtId = formatDistrict(region.id);

  if (party === "0") {
    if (margin === 0) SAFE_D.push(districtId);
    else if (margin === 1) LIKELY_D.push(districtId);
    else if (margin === 2) LEAN_D.push(districtId);
  } else if (party === "1") {
    if (margin === 2) LEAN_R.push(districtId);
    else if (margin === 1) LIKELY_R.push(districtId);
    else if (margin === 0) SAFE_R.push(districtId);
  }
});

// Sort arrays numerically
const sortDistricts = arr => {
  return arr.sort((a, b) => {
    const stateA = a.slice(0, 2);        // e.g., "AL"
    const stateB = b.slice(0, 2);
    if (stateA < stateB) return -1;
    if (stateA > stateB) return 1;

    const numA = parseInt(a.slice(2));   // e.g., "01" -> 1
    const numB = parseInt(b.slice(2));
    return numA - numB;
  });
};

const result = {
  SAFE_D: sortDistricts(SAFE_D),
  LIKELY_D: sortDistricts(LIKELY_D),
  LEAN_D: sortDistricts(LEAN_D),
  LEAN_R: sortDistricts(LEAN_R),
  LIKELY_R: sortDistricts(LIKELY_R),
  SAFE_R: sortDistricts(SAFE_R),
};

// Save to JSON file
fs.writeFileSync("districtsByRating.json", JSON.stringify(result, null, 2));

console.log("✅ All districts processed and saved to districtsByRating.json");