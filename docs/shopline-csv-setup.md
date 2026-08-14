# SHOPLINE + CSV on Vercel

Host only the location data on Vercel. Paste the embed HTML into SHOPLINE (no full app hosting).

**Single embed file:** `docs/shopline-nearby-embed.html` — copy this entire file into SHOPLINE.

## 1. Deploy CSV to Vercel

From the repo root:

```bash
npx vercel --prod
```

Vercel serves `public/locations.csv` at:

```text
https://YOUR-PROJECT.vercel.app/locations.csv
```

## 2. Update SHOPLINE embed

Open `docs/shopline-nearby-embed.html`, find this line near the bottom:

```javascript
var CSV_URL = "https://YOUR-PROJECT.vercel.app/locations.csv";
```

Replace with your real Vercel URL. Copy the whole file into **客製化語法元件 → 語法**, then **儲存** and **發佈**.

## 3. Edit locations

Edit `public/locations.csv` and redeploy. The SHOPLINE page reloads fresh data (no cache on fetch).

### CSV columns

| Column | Example |
|---|---|
| `sort_order` | `1` = first in list (Airport) |
| `id` | unique slug |
| `name` | English name |
| `name_zh` | Chinese name |
| `type` | `vending` |
| `address_en` | English address |
| `address_zh` | Chinese address |
| `phone` | optional |
| `website` | optional |
| `hours` | e.g. `24 hours` |
| `latitude` | decimal |
| `longitude` | decimal |
| `pinned` | `1` = always stays at top (Airport) |

## Behaviour

- **Default order:** by `sort_order` (Airport = 1)
- **Click a list row:** map zooms to that pin on Google Maps
- **◎ GPS button:** sort by distance, but Airport (`pinned=1`) stays at top
- **➤ button:** opens Google Maps directions

## Current locations (6)

1. Hong Kong International Airport T1 (featured / top)
2. PMQ Central
3. Snap Fitness To Kwa Wan
4. Beacon Hill 9 Lung Kui Rd
5. Beacon Hill 3 Lung Kui Rd
6. Clear Water Bay Peninsula Club — 8 Pung Loi Road / 將軍澳蓬萊路8號

Adjust coordinates in the CSV if pins need fine-tuning in Google Maps.
