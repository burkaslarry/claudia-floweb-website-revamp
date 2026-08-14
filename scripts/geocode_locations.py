#!/usr/bin/env python3
"""Geocode public/locations.csv using Google Geocoding API.

Usage:
  GOOGLE_MAPS_API_KEY=your_key python scripts/geocode_locations.py

Reads address_en + address_zh from each row, geocodes in Hong Kong,
and writes updated latitude/longitude back to public/locations.csv.
"""

from __future__ import annotations

import csv
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "public" / "locations.csv"


def geocode_google(query: str, api_key: str) -> tuple[float, float] | None:
    params = urllib.parse.urlencode(
        {
            "address": query,
            "components": "country:HK",
            "key": api_key,
        }
    )
    url = f"https://maps.googleapis.com/maps/api/geocode/json?{params}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        payload = json.loads(resp.read().decode())

    if payload.get("status") != "OK" or not payload.get("results"):
        return None

    location = payload["results"][0]["geometry"]["location"]
    return float(location["lat"]), float(location["lng"])


def main() -> int:
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "").strip()
    if not api_key:
        print("Set GOOGLE_MAPS_API_KEY to geocode from literal addresses.", file=sys.stderr)
        return 1

    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        print("No rows found in locations.csv", file=sys.stderr)
        return 1

    fieldnames = rows[0].keys()
    updated = 0

    for row in rows:
        query = row.get("address_zh") or row.get("address_en") or row.get("name")
        if not query:
            continue

        result = geocode_google(f"{query}, Hong Kong", api_key)
        if not result:
            print(f"WARN: no result for {row['id']}: {query}")
            continue

        lat, lng = result
        row["latitude"] = f"{lat:.6f}"
        row["longitude"] = f"{lng:.6f}"
        updated += 1
        print(f"{row['id']}: {lat:.6f}, {lng:.6f}  <- {query}")

    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Updated {updated} row(s) in {CSV_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
