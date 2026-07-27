"use client";

import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Flower2,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type StoreKind = "florist" | "vending";

type Store = {
  id: string;
  name: string;
  name_zh: string;
  type: StoreKind;
  is_demo: boolean;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  open_now: boolean;
  hours: string;
  services: string[];
  distance_km: number | null;
};

const fallbackStores: Store[] = [
  {
    id: "fnd-central",
    name: "Flower Nice Day — Central",
    name_zh: "販賣美好・中環",
    type: "vending",
    is_demo: true,
    address: "Central, Hong Kong",
    district: "Central",
    latitude: 22.282,
    longitude: 114.1581,
    open_now: true,
    hours: "24 hours",
    services: ["Fresh bouquets", "Octopus", "Card"],
    distance_km: 0.8,
  },
  {
    id: "fnd-admiralty",
    name: "Flower Nice Day — Admiralty",
    name_zh: "販賣美好・金鐘",
    type: "vending",
    is_demo: true,
    address: "Admiralty, Hong Kong",
    district: "Admiralty",
    latitude: 22.2795,
    longitude: 114.1654,
    open_now: true,
    hours: "24 hours",
    services: ["Fresh bouquets", "Octopus", "Card"],
    distance_km: 1.7,
  },
  {
    id: "claudia-cwb",
    name: "Florist Claudia",
    name_zh: "Claudia 花店",
    type: "florist",
    is_demo: true,
    address: "Causeway Bay, Hong Kong",
    district: "Causeway Bay",
    latitude: 22.2802,
    longitude: 114.1849,
    open_now: true,
    hours: "10:00–19:00",
    services: ["Custom bouquets", "Wedding", "Events"],
    distance_km: 3.1,
  },
];

const categories = [
  {
    title: "Bouquets",
    subtitle: "Everyday flowers",
    image: "/assets/bouquet.png",
  },
  {
    title: "Weddings",
    subtitle: "Made for your day",
    image: "/assets/wedding-decoration.png",
  },
  {
    title: "Events",
    subtitle: "Spaces in bloom",
    image: "/assets/event-decoration.png",
  },
];

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function FlowerFinder() {
  const [stores, setStores] = useState(fallbackStores);
  const [activeTab, setActiveTab] = useState<
    "discover" | "nearby" | "orders"
  >("discover");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<StoreKind | "all">("all");
  const [locationLabel, setLocationLabel] = useState("Hong Kong");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const visibleStores = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return stores.filter((store) => {
      const matchesKind = kind === "all" || store.type === kind;
      const searchable =
        `${store.name} ${store.name_zh} ${store.address} ${store.district}`.toLocaleLowerCase();
      return matchesKind && (!needle || searchable.includes(needle));
    });
  }, [kind, query, stores]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
          });
          const response = await fetch(`${apiBase}/api/locations?${params}`);
          if (!response.ok) throw new Error("Location service unavailable");
          const nearbyStores = (await response.json()) as Store[];
          setStores(nearbyStores);
          setLocationLabel("Current location");
          setLocationMessage("Nearest flower spots are now first.");
        } catch {
          setLocationLabel("Current location");
          setLocationMessage("Using prototype stores while the API is offline.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationMessage(
          "Location access was not allowed. Search by district instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4f1] pb-28 text-[#2e2825]">
      <div className="mx-auto min-h-screen max-w-[430px] overflow-hidden bg-[#fffdfb] shadow-[0_0_60px_rgba(78,49,39,0.12)] sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:rounded-[36px] sm:border sm:border-white">
        <header className="sticky top-0 z-30 border-b border-[#efe8e3]/80 bg-[#fffdfb]/90 px-5 pb-3 pt-[max(14px,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/flower-nice-day.png"
                alt="Flower Nice Day"
                width={44}
                height={44}
                priority
                className="rounded-full border border-[#f2dce1] object-cover"
              />
              <div>
                <p className="font-serif text-[18px] font-semibold tracking-[0.02em]">
                  Flower Nice Day
                </p>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="flex items-center gap-1 text-xs font-medium text-[#9a5a69]"
                >
                  <MapPin size={12} strokeWidth={2.2} />
                  {locationLabel}
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Shopping bag"
              className="grid size-10 place-items-center rounded-full bg-[#f7ecee] text-[#a44f64]"
            >
              <ShoppingBag size={19} />
            </button>
          </div>
        </header>

        <section
          className={activeTab === "discover" ? "px-5 pt-5" : "hidden"}
        >
          <div className="relative h-[228px] overflow-hidden rounded-[28px] bg-[#ead6d7]">
            <Image
              src="/assets/florist-claudia.png"
              alt="Florist Claudia bouquet collection"
              fill
              priority
              sizes="(max-width: 430px) 100vw, 390px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#311b1c]/75 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] backdrop-blur">
                <Sparkles size={12} />
                Florist spotlight
              </span>
              <h1 className="font-serif text-[30px] font-semibold leading-none">
                Flowers, right when
                <br />
                you need them.
              </h1>
            </div>
          </div>
        </section>

        <section className={activeTab === "nearby" ? "px-5 pt-7" : "hidden"}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b16b7b]">
                Near you
              </p>
              <h2 className="mt-1 font-serif text-[26px] font-semibold">
                Find fresh flowers
              </h2>
            </div>
            <span className="pb-1 text-xs text-[#8c817c]">
              {visibleStores.length} places
            </span>
          </div>

          <div className="mb-3 rounded-2xl border border-[#efd9c8] bg-[#fff7ed] px-4 py-3 text-xs leading-5 text-[#7e5b43]">
            <strong>Demo locations:</strong> client documents do not include
            confirmed shop or vending-machine addresses. Replace these samples
            before launch.
          </div>

          <div className="rounded-[24px] border border-[#eee3df] bg-white p-3 shadow-[0_12px_36px_rgba(83,53,43,0.08)]">
            <label className="flex h-12 items-center gap-3 rounded-2xl bg-[#f8f4f2] px-4">
              <Search size={18} className="text-[#ad6a79]" />
              <span className="sr-only">Search by district or store</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search area or flower spot"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a79c97]"
              />
              <button
                type="button"
                onClick={useCurrentLocation}
                aria-label="Use my current location"
                className="grid size-8 place-items-center rounded-full bg-white text-[#a44f64] shadow-sm"
              >
                <LocateFixed
                  size={16}
                  className={locating ? "animate-pulse" : ""}
                />
              </button>
            </label>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { value: "all", label: "All", icon: Flower2 },
                { value: "vending", label: "24/7", icon: Sparkles },
                { value: "florist", label: "Florists", icon: StoreIcon },
              ].map((filter) => {
                const Icon = filter.icon;
                const selected = kind === filter.value;
                return (
                  <button
                    type="button"
                    key={filter.value}
                    onClick={() => setKind(filter.value as StoreKind | "all")}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition ${
                      selected
                        ? "bg-[#ad5268] text-white"
                        : "bg-[#fbf8f6] text-[#776b66]"
                    }`}
                  >
                    <Icon size={14} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {locationMessage ? (
            <p className="mt-3 px-1 text-xs leading-5 text-[#8d5d68]">
              {locationMessage}
            </p>
          ) : null}
        </section>

        <section className={activeTab === "nearby" ? "px-5 pt-5" : "hidden"}>
          <div className="relative h-36 overflow-hidden rounded-[24px] bg-[#f3eae6]">
            <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(#d8ccc6_1px,transparent_1px),linear-gradient(90deg,#d8ccc6_1px,transparent_1px)] [background-size:34px_34px]" />
            <div className="absolute left-[18%] top-[33%] h-px w-[60%] rotate-[-10deg] border-t-2 border-dashed border-[#c6929e]" />
            {visibleStores.slice(0, 3).map((store, index) => (
              <div
                key={store.id}
                className="absolute grid size-9 place-items-center rounded-full border-[3px] border-white bg-[#ac5167] text-white shadow-lg"
                style={{
                  left: `${22 + index * 27}%`,
                  top: `${28 + (index % 2) * 31}%`,
                }}
              >
                {store.type === "vending" ? (
                  <Flower2 size={15} />
                ) : (
                  <StoreIcon size={15} />
                )}
              </div>
            ))}
            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#6f5e57] shadow-sm backdrop-blur">
              Demo map
            </div>
          </div>
        </section>

        <section className={activeTab === "nearby" ? "px-5 pt-4" : "hidden"}>
          <div className="space-y-3">
            {visibleStores.map((store) => (
              <article
                key={store.id}
                className="flex gap-3 rounded-[22px] border border-[#f0e7e3] bg-white p-3.5"
              >
                <div
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                    store.type === "vending"
                      ? "bg-[#f7e2e7] text-[#aa5267]"
                      : "bg-[#e5eee7] text-[#56745d]"
                  }`}
                >
                  {store.type === "vending" ? (
                    <Flower2 size={21} />
                  ) : (
                    <StoreIcon size={21} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="truncate text-sm font-bold">{store.name}</h3>
                      <p className="mt-0.5 text-xs text-[#9a8c86]">
                        {store.name_zh}
                      </p>
                    </div>
                    {store.distance_km !== null ? (
                      <span className="shrink-0 rounded-full bg-[#f7f2ef] px-2 py-1 text-[10px] font-bold text-[#805f57]">
                        {store.distance_km} km
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[#756965]">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      {store.hours}
                    </span>
                    <span className="font-semibold text-[#5c875f]">Open</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Directions to ${store.name}`}
                  className="grid size-9 shrink-0 self-center place-items-center rounded-full bg-[#322a27] text-white"
                >
                  <Navigation size={15} fill="currentColor" />
                </button>
              </article>
            ))}
          </div>
          {visibleStores.length === 0 ? (
            <div className="rounded-[22px] bg-[#f8f3f1] px-5 py-8 text-center">
              <Flower2 className="mx-auto text-[#bd8290]" />
              <p className="mt-3 text-sm font-semibold">No flower spots found</p>
              <p className="mt-1 text-xs text-[#8f817b]">
                Try another district or clear the filter.
              </p>
            </div>
          ) : null}
        </section>

        <section className={activeTab === "discover" ? "px-5 pt-9" : "hidden"}>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b16b7b]">
              From the client catalogue
            </p>
            <h2 className="mt-1 font-serif text-[25px] font-semibold">
              Florist Claudia pink bouquet
            </h2>
          </div>
          <article className="overflow-hidden rounded-[24px] border border-[#eee4df] bg-white">
            <div className="relative h-44">
              <Image
                src="/assets/florist-claudia.png"
                alt="Florist Claudia pink bouquet collection"
                fill
                sizes="390px"
                className="object-cover object-left"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">
                    Florist Claudia - Pink series bouquet
                  </h3>
                  <p className="mt-1 text-xs text-[#9a8c86]">
                    Florist Claudia 粉色系花束
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f7ecee] px-2.5 py-1 text-[10px] font-bold text-[#a45266]">
                  Price pending
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#70645f]">
                Seasonal flowers and foliage make every bouquet unique. Images
                are for reference; each bouquet is redesigned to your chosen
                colour scheme.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-[#6f625d]">
                {["HK Island", "Kowloon", "New Territories"].map((zone) => (
                  <span
                    key={zone}
                    className="rounded-full bg-[#f8f4f2] px-2.5 py-1.5"
                  >
                    Free delivery · {zone}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className={activeTab === "discover" ? "px-5 pt-9" : "hidden"}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-[25px] font-semibold">
              Made for your moment
            </h2>
            <button
              type="button"
              className="flex items-center text-xs font-bold text-[#a45266]"
            >
              View all <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <article
                key={category.title}
                className="w-[178px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-[#eee4df] bg-white"
              >
                <div className="relative h-28">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="178px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-bold">{category.title}</h3>
                  <p className="mt-1 text-xs text-[#968984]">
                    {category.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {activeTab === "orders" ? (
          <section className="px-5 pt-8">
            <div className="rounded-[24px] border border-[#eee4df] bg-white px-6 py-12 text-center">
              <ShoppingBag className="mx-auto text-[#b96c7d]" size={28} />
              <h2 className="mt-4 font-serif text-2xl font-semibold">
                Your orders
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#8e817b]">
                Sign in to view your order and delivery status.
              </p>
            </div>
          </section>
        ) : null}

        <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[calc(100%-24px)] max-w-[406px] items-center justify-around rounded-[24px] border border-white/80 bg-white/90 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_10px_40px_rgba(58,37,31,0.18)] backdrop-blur-xl sm:bottom-8">
          {[
            { id: "discover", label: "Discover", icon: Flower2 },
            { id: "nearby", label: "Nearby", icon: MapPin },
            { id: "orders", label: "Orders", icon: ShoppingBag },
          ].map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.label}
                onClick={() =>
                  setActiveTab(item.id as "discover" | "nearby" | "orders")
                }
                aria-current={selected ? "page" : undefined}
                className={`flex min-w-20 flex-col items-center gap-1 text-[10px] font-semibold ${
                  selected ? "text-[#a84f65]" : "text-[#9a908b]"
                }`}
              >
                <Icon size={20} strokeWidth={selected ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
