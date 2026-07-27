from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


LocationType = Literal["florist", "vending"]


class Store(BaseModel):
    id: str
    name: str
    name_zh: str
    type: LocationType
    is_demo: bool = True
    address: str
    district: str
    latitude: float
    longitude: float
    open_now: bool
    hours: str
    services: list[str]
    distance_km: float | None = None


STORES = [
    Store(
        id="fnd-central",
        name="Flower Nice Day — Central",
        name_zh="販賣美好・中環",
        type="vending",
        address="Central, Hong Kong",
        district="Central",
        latitude=22.2820,
        longitude=114.1581,
        open_now=True,
        hours="24 hours",
        services=["Fresh bouquets", "Octopus", "Card"],
    ),
    Store(
        id="fnd-admiralty",
        name="Flower Nice Day — Admiralty",
        name_zh="販賣美好・金鐘",
        type="vending",
        address="Admiralty, Hong Kong",
        district="Admiralty",
        latitude=22.2795,
        longitude=114.1654,
        open_now=True,
        hours="24 hours",
        services=["Fresh bouquets", "Octopus", "Card"],
    ),
    Store(
        id="claudia-cwb",
        name="Florist Claudia",
        name_zh="Claudia 花店",
        type="florist",
        address="Causeway Bay, Hong Kong",
        district="Causeway Bay",
        latitude=22.2802,
        longitude=114.1849,
        open_now=True,
        hours="10:00–19:00",
        services=["Custom bouquets", "Wedding", "Events"],
    ),
    Store(
        id="fnd-tst",
        name="Flower Nice Day — Tsim Sha Tsui",
        name_zh="販賣美好・尖沙咀",
        type="vending",
        address="Tsim Sha Tsui, Kowloon",
        district="Tsim Sha Tsui",
        latitude=22.2975,
        longitude=114.1722,
        open_now=True,
        hours="24 hours",
        services=["Fresh bouquets", "Octopus", "Card"],
    ),
]


def distance_km(lat_a: float, lng_a: float, lat_b: float, lng_b: float) -> float:
    earth_radius_km = 6371.0
    d_lat = radians(lat_b - lat_a)
    d_lng = radians(lng_b - lng_a)
    value = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(d_lng / 2) ** 2
    )
    return earth_radius_km * 2 * asin(sqrt(value))


app = FastAPI(
    title="Flower Nice Day Locations API",
    version="0.1.0",
    description="Prototype API for nearby flower shops and vending machines.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/locations", response_model=list[Store])
def locations(
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    kind: LocationType | None = None,
    query: str | None = None,
) -> list[Store]:
    matches = [store.model_copy(deep=True) for store in STORES]

    if kind:
        matches = [store for store in matches if store.type == kind]

    if query:
        needle = query.casefold().strip()
        matches = [
            store
            for store in matches
            if needle
            in " ".join(
                [store.name, store.name_zh, store.address, store.district]
            ).casefold()
        ]

    if latitude is not None and longitude is not None:
        for store in matches:
            store.distance_km = round(
                distance_km(latitude, longitude, store.latitude, store.longitude), 1
            )
        matches.sort(
            key=lambda store: (
                store.distance_km if store.distance_km is not None else float("inf")
            )
        )

    return matches
