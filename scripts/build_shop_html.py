#!/usr/bin/env python3
"""Build public/shop.html from the SHOPLINE embed fragment.

Also injects public/locations.csv into the embed fallback so SHOPLINE
still renders if remote fetch is blocked.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMBED = ROOT / "docs" / "shopline-nearby-embed.html"
CSV_PATH = ROOT / "public" / "locations.csv"
JS_PATH = ROOT / "public" / "locations.js"
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

JS_CSV_RE = re.compile(
    r"/\* FND_FALLBACK_CSV_START \*/.*?/\* FND_FALLBACK_CSV_END \*/",
    re.DOTALL,
)
TEXTAREA_RE = re.compile(
    r"<!-- FND_CSV_TEXTAREA_START -->.*?<!-- FND_CSV_TEXTAREA_END -->",
    re.DOTALL,
)


def inject_fallback(fragment: str, csv_text: str) -> str:
    js_csv = json.dumps(csv_text, ensure_ascii=False)
    js_block = (
        "/* FND_FALLBACK_CSV_START */\n"
        f"      var FALLBACK_CSV = {js_csv};\n"
        "      /* FND_FALLBACK_CSV_END */"
    )
    fragment = JS_CSV_RE.sub(lambda _: js_block, fragment, count=1)
    safe_csv = csv_text.replace("</textarea>", "&lt;/textarea&gt;")
    textarea_block = (
        "<!-- FND_CSV_TEXTAREA_START -->\n"
        '  <textarea id="fnd-csv-fallback" class="fnd-csv-fallback" hidden readonly>'
        f"{safe_csv}"
        "</textarea>\n"
        "  <!-- FND_CSV_TEXTAREA_END -->"
    )
    fragment = TEXTAREA_RE.sub(lambda _: textarea_block, fragment, count=1)
    return fragment


def shop_urls(fragment: str) -> str:
    return (
        fragment.replace(
            'var CSV_URLS = ["https://claudia-floweb.vercel.app/locations.csv"];',
            'var CSV_URLS = ["/locations.csv", "https://claudia-floweb.vercel.app/locations.csv"];',
        ).replace(
            'var CSV_JS_URL = "https://claudia-floweb.vercel.app/locations.js";',
            'var CSV_JS_URL = "/locations.js";',
        )
    )


def main() -> None:
    csv_text = CSV_PATH.read_text(encoding="utf-8").replace("\r\n", "\n").strip() + "\n"
    fragment = inject_fallback(EMBED.read_text(encoding="utf-8"), csv_text)
    EMBED.write_text(fragment, encoding="utf-8")
    JS_PATH.write_text(
        "window.__FND_CSV__ = " + json.dumps(csv_text, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    OUT.write_text(WRAPPER_HEAD + shop_urls(fragment) + WRAPPER_TAIL, encoding="utf-8")
    print(f"Wrote {EMBED}")
    print(f"Wrote {JS_PATH}")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
