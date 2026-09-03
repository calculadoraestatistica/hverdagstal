"""Henter live-tal til hverdagstal.dk fra to aabne, noeglefri API'er.

  * Elpris  : Energi Data Service (Energinet), dataset DayAheadPrices,
              15-minutters day-ahead-priser for DK1 (Vestdanmark) og DK2
              (OEstdanmark). Gemmes som dagsgennemsnit/min/max i oere pr. kWh
              (API'et leverer DKK pr. MWh -> divideret med 10).
  * CPI     : Danmarks Statistik, tabel PRIS01 (forbrugerprisindeks, 2025=100),
              seneste maaned: indeks + aendring i forhold til samme maaned aaret foer.

Begge kilder er offentlige og gratis. Fejl paa den ene kilde stopper ikke
den anden, og en fejl efterlader den foregaaende fil uroert (softfail), saa
sitet aldrig viser et tomt felt fordi et API var nede i fem minutter.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
UA = {"User-Agent": "hverdagstal.dk data-refresh (kontakt via hverdagstal.dk/kontakt.html)"}


def _get(url: str, timeout: int = 40) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _save(name: str, payload: dict) -> None:
    p = DATA / name
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(p)
    print(f"OK {name}")


# ─── Elpris ────────────────────────────────────────────────────────────────
def fetch_elpris() -> None:
    today = date.today()
    q = urllib.parse.urlencode({
        "start": today.isoformat(),
        "end": (today + timedelta(days=2)).isoformat(),
        "filter": json.dumps({"PriceArea": ["DK1", "DK2"]}),
        "sort": "TimeDK asc",
        "limit": 1000,
    })
    d = _get("https://api.energidataservice.dk/dataset/DayAheadPrices?" + q)
    recs = d.get("records", [])
    if not recs:
        raise RuntimeError("DayAheadPrices returnerede ingen raekker")

    by = defaultdict(lambda: defaultdict(list))  # area -> dato -> [oere/kWh]
    for r in recs:
        pris = r.get("DayAheadPriceDKK")
        if pris is None:
            continue
        dag = r["TimeDK"][:10]
        by[r["PriceArea"]][dag].append(pris / 10.0)  # DKK/MWh -> oere/kWh

    out = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "unit": "oere/kWh", "note": "Day-ahead spotpris ekskl. tariffer, elafgift og moms.",
           "source": "Energi Data Service (Energinet), dataset DayAheadPrices",
           "source_url": "https://www.energidataservice.dk/tso-electricity/DayAheadPrices",
           "areas": {}}
    for area, dage in by.items():
        out["areas"][area] = {}
        for dag, vals in sorted(dage.items()):
            if len(vals) < 20:  # ufuldstaendig dag (kun nogle kvarter) springes over
                continue
            out["areas"][area][dag] = {
                "avg": round(sum(vals) / len(vals), 1),
                "min": round(min(vals), 1),
                "max": round(max(vals), 1),
                "points": len(vals),
            }
    if not any(out["areas"].values()):
        raise RuntimeError("ingen fuldstaendige dage i svaret")
    _save("elpris.json", out)


# ─── Forbrugerprisindeks ───────────────────────────────────────────────────
def fetch_cpi() -> None:
    """PRIS01 via Statbankens CSV-format: en raekke pr. (enhed, maaned)."""
    import csv
    import io
    body = json.dumps({
        "table": "PRIS01", "format": "CSV", "lang": "da", "valuePresentation": "CodeAndValue",
        "variables": [
            {"code": "VAREGR", "values": ["000000"]},   # forbrugerprisindekset i alt
            {"code": "ENHED", "values": ["100", "200", "300"]},
            {"code": "Tid", "values": ["*"]},
        ],
    }).encode("utf-8")
    req = urllib.request.Request("https://api.statbank.dk/v1/data", data=body,
                                 headers={**UA, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        text = r.read().decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(text), delimiter=";"))
    header = [h.strip().upper() for h in rows[0]]
    ci = {name: header.index(name) for name in ("ENHED", "TID", "INDHOLD")}

    def tal(s: str):
        s = s.strip().replace(",", ".")
        try:
            return float(s)
        except ValueError:
            return None

    per_tid: dict[str, dict[str, float]] = {}
    labels: dict[str, str] = {}
    for row in rows[1:]:
        if len(row) <= max(ci.values()):
            continue
        enhed_raw, tid_raw, vaerdi = row[ci["ENHED"]], row[ci["TID"]], tal(row[ci["INDHOLD"]])
        kode = enhed_raw.split(" ", 1)[0].strip()          # "100 Indeks" -> "100"
        tid = tid_raw.split(" ", 1)[0].strip()              # "2026M07 2026M07" -> "2026M07"
        labels.setdefault(tid, tid_raw.split(" ", 1)[-1].strip() if " " in tid_raw else tid_raw)
        if vaerdi is not None:
            per_tid.setdefault(tid, {})[kode] = vaerdi

    seneste = max((t for t, v in per_tid.items() if "100" in v), default=None)
    if seneste is None:
        raise RuntimeError("ingen CPI-vaerdi fundet i CSV")
    v = per_tid[seneste]
    aar, md = seneste.split("M")
    mdr = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"]
    out = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "table": "PRIS01", "period": seneste, "period_label": f"{mdr[int(md) - 1]} {aar}",
           "index": v.get("100"), "yoy_pct": v.get("300"), "mom_pct": v.get("200"),
           "source": "Danmarks Statistik, PRIS01 (forbrugerprisindeks, 2025=100)",
           "source_url": "https://www.statistikbanken.dk/PRIS01"}
    _save("cpi.json", out)


def main() -> int:
    fejl = 0
    for navn, fn in (("elpris", fetch_elpris), ("cpi", fetch_cpi)):
        try:
            fn()
        except Exception as exc:  # noqa: BLE001 — softfail pr. kilde
            fejl += 1
            print(f"AVISO {navn}: {type(exc).__name__}: {exc} — beholder forrige fil", file=sys.stderr)
    # Begge kilder fejlede -> reel alarm (email). Kun en -> stille, naeste koersel proever igen.
    return 1 if fejl == 2 else 0


if __name__ == "__main__":
    sys.exit(main())
