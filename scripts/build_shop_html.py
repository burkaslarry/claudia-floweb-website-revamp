#!/usr/bin/env python3
"""Build public/shop.html from the SHOPLINE embed fragment."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMBED = ROOT / "docs" / "shopline-nearby-embed.html"
OUT = ROOT / "public" / "shop.html"

WRAPPER_HEAD = """<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Flower Nice Day — 販賣機網店</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #f7f4f1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
  </style>
</head>
<body>
"""

WRAPPER_TAIL = """
</body>
</html>
"""


def main() -> None:
    fragment = EMBED.read_text(encoding="utf-8")
    fragment = fragment.replace(
        'var CSV_URL = "https://claudia-floweb.vercel.app/locations.csv";',
        'var CSV_URL = "/locations.csv";',
    )
    OUT.write_text(WRAPPER_HEAD + fragment + WRAPPER_TAIL, encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
