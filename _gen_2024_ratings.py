"""
Build 2024 House winner + margin buckets from FiveThirtyEight CSV, aligned to map ids.
- Maps AK-01 -> AK-AL (and DE, ND, SD, VT, WY) to match SVG labels.
- Louisiana missing from CSV: manual 2024 classifications.
- DC not in CSV: safe-d (delegate election).
"""
import csv
import io
import urllib.request
from collections import defaultdict

URL = "https://raw.githubusercontent.com/fivethirtyeight/election-results/main/election_results_house.csv"

# Single-member states labeled At Large on the map
CSV_TO_MAP_ID = {
    "AK-01": "AK-AL",
    "DE-01": "DE-AL",
    "ND-01": "ND-AL",
    "SD-01": "SD-AL",
    "VT-01": "VT-AL",
    "WY-01": "WY-AL",
}

# 2024 results — Louisiana not in 538 house CSV (naming / ingestion gap)
LA_2024 = {
    "LA-01": "safe-r",
    "LA-02": "safe-d",
    "LA-03": "safe-r",
    "LA-04": "safe-r",
    "LA-05": "safe-r",
    "LA-06": "safe-d",
}

def seat_to_csv_code(state_abbrev: str, seat: str) -> str | None:
    s = seat.strip()
    if "At Large" in s or s == "At-Large District":
        return f"{state_abbrev}-AL"
    if s.startswith("District "):
        n = int(s.replace("District ", "").strip())
        return f"{state_abbrev}-{n:02d}"
    return None


def to_map_id(csv_code: str) -> str:
    return CSV_TO_MAP_ID.get(csv_code, csv_code)


def classify(margin: float, dem_won: bool) -> str:
    if margin >= 15:
        return "safe-d" if dem_won else "safe-r"
    if margin >= 8:
        return "likely-d" if dem_won else "likely-r"
    if margin > 0:
        return "lean-d" if dem_won else "lean-r"
    return "tossup"


raw = urllib.request.urlopen(URL).read().decode("utf-8")
reader = csv.DictReader(io.StringIO(raw))

by_seat = defaultdict(list)
for row in reader:
    if row["cycle"] != "2024" or row["stage"] != "general":
        continue
    if row["state_abbrev"] in ("GU", "PR", "VI"):
        continue
    k = (row["state_abbrev"], row["office_seat_name"])
    by_seat[k].append(row)

code_to_cat: dict[str, str] = {}

for (_st, seat), rows in by_seat.items():
    st = rows[0]["state_abbrev"]
    csv_code = seat_to_csv_code(st, seat)
    if not csv_code:
        continue
    code = to_map_id(csv_code)
    ranked = sorted(rows, key=lambda r: float(r["percent"] or 0), reverse=True)
    if not ranked:
        continue
    top = ranked[0]
    top_pct = float(top["percent"] or 0)
    # Unopposed / single effective candidate (no runner-up share in data)
    if len(ranked) < 2 or top_pct >= 99.5:
        tp = (top["ballot_party"] or "").upper()
        if tp == "DEM":
            code_to_cat[code] = "safe-d"
        elif tp == "REP":
            code_to_cat[code] = "safe-r"
        else:
            code_to_cat[code] = "tossup"
        continue
    second = ranked[1]
    margin = top_pct - float(second["percent"] or 0)
    tp = (top["ballot_party"] or "").upper()
    sp = (second["ballot_party"] or "").upper()

    if tp == "DEM":
        code_to_cat[code] = classify(margin, True)
    elif tp == "REP":
        code_to_cat[code] = classify(margin, False)
    elif tp == sp and tp in ("DEM", "REP"):
        # Same-party top two (e.g. CA top-two, LA jungle)
        code_to_cat[code] = "safe-d" if tp == "DEM" else "safe-r"
    else:
        code_to_cat[code] = "tossup"

code_to_cat.update(LA_2024)

# bucket -> list of ids
buckets: dict[str, list[str]] = {k: [] for k in [
    "safe-d", "likely-d", "lean-d", "tossup", "lean-r", "likely-r", "safe-r",
]}
for code, cat in sorted(code_to_cat.items()):
    buckets[cat].append(code)

key_map = {
    "safe-d": "SAFE_D",
    "likely-d": "LIKELY_D",
    "lean-d": "LEAN_D",
    "tossup": "TOSSUP",
    "lean-r": "LEAN_R",
    "likely-r": "LIKELY_R",
    "safe-r": "SAFE_R",
}

print("total coded", len(code_to_cat))
for k, arr in buckets.items():
    print(k, len(arr))

for cat in [
    "safe-d", "likely-d", "lean-d", "tossup", "lean-r", "likely-r", "safe-r",
]:
    name = key_map[cat]
    ids = buckets[cat]
    if not ids:
        print(f"\nconst {name} = [];")
    else:
        inner = ",\n  ".join(f'"{i}"' for i in ids)
        print(f"\nconst {name} = [\n  {inner},\n];")
