import { withRedisCache } from "@/lib/upstash-cache";

const REAL_PRICES = {
  petrolRON92: 458.41,
  diesel: 520.35,
  kerosene: 457.8,
  petrolRON95: 510.0,
  cng: 250.0,
  lastUpdated: "April 3, 2026",
  source: "OGRA / Ministry of Energy",
  previousPetrol: 321.17,
  previousDiesel: 335.86,
};

const BRENT_CRUDE = 109.12;
const PAKWHEELS_PRICES_URL = "https://www.pakwheels.com/petroleum-prices-in-pakistan";
const EIA_BRENT_URL = "https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm";
const PRICE_CACHE_TTL_SECONDS = 60 * 30;
const BRENT_CACHE_TTL_SECONDS = 60 * 30;
const FEED_CACHE_TTL_SECONDS = 60 * 10;

const CITIES = [
  { name: "Karachi", region: "Sindh", isPort: true },
  { name: "Lahore", region: "Punjab", isPort: false },
  { name: "Islamabad", region: "ICT", isPort: false },
  { name: "Rawalpindi", region: "Punjab", isPort: false },
  { name: "Peshawar", region: "KPK", isPort: false },
  { name: "Quetta", region: "Balochistan", isPort: false },
  { name: "Multan", region: "Punjab", isPort: false },
  { name: "Faisalabad", region: "Punjab", isPort: false },
];

const CITY_BASE_WEIGHT = {
  Karachi: 0.55,
  Lahore: 0.35,
  Islamabad: 0.4,
  Rawalpindi: 0.38,
  Peshawar: 0.25,
  Quetta: 0.2,
  Multan: 0.3,
  Faisalabad: 0.32,
};

const FEED_PROMPT = `You are a fuel crisis news aggregator for Pakistan. Provide factual crisis updates based on real verified events as of April 2026.

Real facts to use:
- US-Israel launched strikes on Iran on Feb 28, 2026 (Operation Epic Fury)
- Iran blocked the Strait of Hormuz on Mar 4, 2026
- Pakistan raised petrol to Rs458.41/L (+Rs137.24) and diesel to Rs520.35/L (+Rs184.49) on Apr 3, 2026
- Previous prices (Mar 7): petrol Rs321.17, diesel Rs335.86
- Brent crude peaked at $126/bbl, now ~$109
- Motorcycle subsidy: Rs100/L off on up to 20L/month
- Quetta and Peshawar have worst shortages due to distance from ports
- Karachi port still receiving some tankers despite disruptions
- PM Shehbaz Sharif had rejected two earlier summary hikes
- IMF programme ongoing; PDL (petroleum development levy) ~Rs70/L

Return ONLY a JSON array of exactly 5 items. No markdown. No preamble. Schema per item: { "tag": "crisis"|"supply"|"price"|"policy", "headline": max 85 chars, "detail": max 110 chars, "time": plausible time like "2h ago" or "Apr 3" }`;

function weightedStatus(weight) {
  if (weight < 0.25) return "Critical";
  if (weight < 0.4) return "Severe";
  if (weight < 0.6) return "Moderate";
  return "Stable";
}

function randomBetween(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(1);
}

function generateCityData() {
  return CITIES.map((city) => {
    const weight = Math.min(
      1,
      Math.max(0, CITY_BASE_WEIGHT[city.name] + randomBetween(-0.06, 0.06))
    );
    const status = weightedStatus(weight);
    const availabilityScore = Math.round(weight * 100);
    const isCritical = status === "Critical";
    const isSevere = status === "Severe";

    return {
      ...city,
      status,
      availabilityScore,
      queueLength: Math.floor(
        randomBetween(isCritical ? 50 : isSevere ? 25 : 5, isCritical ? 120 : isSevere ? 70 : 30)
      ),
      pumpsFunctional: `${Math.floor(
        randomBetween(isCritical ? 2 : 5, isCritical ? 6 : 14)
      )}/${Math.floor(randomBetween(14, 22))}`,
      lastRestocked: `${Math.floor(
        randomBetween(isCritical ? 24 : 4, isCritical ? 72 : 18)
      )}h ago`,
      priceRON92: isCritical
        ? +(REAL_PRICES.petrolRON92 + randomBetween(20, 80)).toFixed(2)
        : REAL_PRICES.petrolRON92,
      priceDiesel: isCritical
        ? +(REAL_PRICES.diesel + randomBetween(30, 100)).toFixed(2)
        : REAL_PRICES.diesel,
      blackMarket: isCritical,
      supplyChain: Math.round(weight * 100 + randomBetween(-5, 5)),
      storageLevel: Math.round(weight * 80 + randomBetween(5, 20)),
    };
  });
}

function sanitizeFeedItems(items) {
  if (!Array.isArray(items)) return null;

  const normalized = items
    .map((item) => ({
      tag: typeof item?.tag === "string" ? item.tag.toLowerCase() : "crisis",
      headline: typeof item?.headline === "string" ? item.headline.trim() : "",
      detail: typeof item?.detail === "string" ? item.detail.trim() : "",
      time: typeof item?.time === "string" ? item.time.trim() : "",
    }))
    .filter((item) => item.headline && item.detail && item.time);

  if (normalized.length !== 5) return null;

  return normalized.map((item) => ({
    ...item,
    tag: ["crisis", "supply", "price", "policy"].includes(item.tag) ? item.tag : "crisis",
  }));
}

function getFallbackFeedItems() {
  return [
    {
      tag: "crisis",
      headline: "Hormuz disruption keeps Pakistan fuel market under pressure",
      detail: "Import costs remain elevated as shipping routes stay constrained after the March closure.",
      time: "Apr 5",
    },
    {
      tag: "price",
      headline: "OGRA price jump leaves petrol at Rs458.41 and diesel at Rs520.35",
      detail: "The April 3 revision remains the current official benchmark for retail fuel pricing.",
      time: "Apr 3",
    },
    {
      tag: "supply",
      headline: "Karachi supply stays firmer than inland markets",
      detail: "Port access is helping Karachi recover faster while Quetta and Peshawar face sharper shortages.",
      time: "6h ago",
    },
    {
      tag: "policy",
      headline: "Motorcycle subsidy still softens the blow for small consumers",
      detail: "Eligible riders can receive Rs100 per litre relief on up to 20 litres per month.",
      time: "8h ago",
    },
    {
      tag: "supply",
      headline: "Modelled availability remains weakest in western and northern cities",
      detail: "Distance from ports and transport bottlenecks continue to stretch queue times and restocks.",
      time: "10h ago",
    },
  ];
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Source request failed with status ${response.status}`);
  }

  return response.text();
}

function normalizeHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parsePakWheelsPrices(html) {
  const text = normalizeHtmlToText(html);
  const summaryMatch = text.match(
    /Current and Latest Petrol Price in Pakistan is Rs\.\s*([\d.]+)\/Ltr,\s*High Speed Diesel is Rs\.\s*([\d.]+)\/Ltr/i
  );
  const effectiveDateMatch = text.match(/Prices w\.e\.f\s+([0-9]{2}-[A-Za-z]+-[0-9]{4})/i);
  const petrolRowMatch = text.match(/Petrol \(Super\)\s+PKR\s+([\d.]+)\s+PKR\s+([\d.]+)\s+([\d.]+)/i);
  const dieselRowMatch = text.match(/High Speed Diesel\s+PKR\s+([\d.]+)\s+PKR\s+([\d.]+)\s+([\d.]+)/i);
  const keroseneRowMatch = text.match(/Kerosene Oil\s+PKR\s+([\d.]+)\s+PKR\s+([\d.]+)\s+([\d.]+)/i);
  const lsdRowMatch = text.match(/Light Speed Diesel\s+PKR\s+([\d.]+)\s+PKR\s+([\d.]+)\s+([\d.]+)/i);
  const lpgMatch = text.match(/liquid petroleum price in Pakistan is RS\s*([\d.]+)\s*per kg,\s*effective\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);

  if (!summaryMatch || !petrolRowMatch || !dieselRowMatch || !keroseneRowMatch) {
    throw new Error("Unable to parse Pakistan fuel prices from PakWheels");
  }

  return {
    petrolRON92: Number(summaryMatch[1]),
    diesel: Number(summaryMatch[2]),
    kerosene: Number(keroseneRowMatch[2]),
    previousPetrol: Number(petrolRowMatch[1]),
    previousDiesel: Number(dieselRowMatch[1]),
    lastUpdated: effectiveDateMatch ? effectiveDateMatch[1] : "Unknown",
    source: "PakWheels live petroleum prices",
    sourceUrl: PAKWHEELS_PRICES_URL,
    petrolRON95: REAL_PRICES.petrolRON95,
    cng: REAL_PRICES.cng,
    lsd: lsdRowMatch ? Number(lsdRowMatch[2]) : null,
    lpgPerKg: lpgMatch ? Number(lpgMatch[1]) : null,
    lpgLastUpdated: lpgMatch ? lpgMatch[2] : null,
  };
}

function parseEiaBrent(html) {
  const text = normalizeHtmlToText(html);
  const dateRowMatch = text.match(/Daily Weekly Monthly Annual ([0-9/ ]+) View History/i);
  const brentRowMatch = text.match(/Brent - Europe\s+([0-9. ]+)\s+Conventional Gasoline/i);
  const releaseDateMatch = text.match(/Release Date:\s*([0-9/]+)/i);

  if (!dateRowMatch || !brentRowMatch) {
    throw new Error("Unable to parse Brent crude prices from EIA");
  }

  const periods = dateRowMatch[1].trim().split(/\s+/);
  const values = brentRowMatch[1].trim().split(/\s+/).map(Number);

  return {
    value: values.at(-1),
    period: periods.at(-1) || null,
    releaseDate: releaseDateMatch ? releaseDateMatch[1] : null,
    source: "U.S. EIA spot prices",
    sourceUrl: EIA_BRENT_URL,
  };
}

async function fetchLivePakistanPrices() {
  const { value, cache } = await withRedisCache(
    "petro:prices:pakistan",
    PRICE_CACHE_TTL_SECONDS,
    async () => {
      const html = await fetchPage(PAKWHEELS_PRICES_URL);

      return {
        ...parsePakWheelsPrices(html),
        live: true,
        error: null,
      };
    }
  );

  return {
    ...value,
    cache,
  };
}

async function fetchLiveBrentCrude() {
  const { value, cache } = await withRedisCache(
    "petro:prices:brent",
    BRENT_CACHE_TTL_SECONDS,
    async () => {
      const html = await fetchPage(EIA_BRENT_URL);
      const parsed = parseEiaBrent(html);

      return {
        value: parsed.value,
        period: parsed.period,
        releaseDate: parsed.releaseDate,
        source: parsed.source,
        sourceUrl: parsed.sourceUrl,
        live: true,
        error: null,
      };
    }
  );

  return {
    ...value,
    cache,
  };
}

async function fetchAIFeedItems() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      items: getFallbackFeedItems(),
      sourceLabel: "Fallback Feed",
      feedError: "ANTHROPIC_API_KEY is not configured",
    };
  }

  try {
    const { value, cache } = await withRedisCache(
      "petro:feed:ai",
      FEED_CACHE_TTL_SECONDS,
      async () => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: FEED_PROMPT,
            messages: [
              {
                role: "user",
                content: "Generate 5 Pakistan petrol crisis news items. JSON array only, no explanation.",
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic request failed with status ${response.status}`);
        }

        const data = await response.json();
        const text = (data.content || []).map((block) => block.text || "").join("");
        const cleaned = text.replace(/```json|```/g, "").trim();
        const items = sanitizeFeedItems(JSON.parse(cleaned));

        if (!items) {
          throw new Error("Anthropic returned an unexpected feed format");
        }

        return { items, sourceLabel: "Claude AI", feedError: null };
      }
    );

    return {
      ...value,
      cache,
    };
  } catch (error) {
    return {
      items: getFallbackFeedItems(),
      sourceLabel: "Fallback Feed",
      feedError: error instanceof Error ? error.message : "AI feed unavailable",
      cache: {
        provider: process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "none",
        status: "fallback",
        hit: false,
        key: "petro:feed:ai",
        ttlSeconds: FEED_CACHE_TTL_SECONDS,
      },
    };
  }
}

export async function getPetroDashboardData() {
  const [prices, brent, feed] = await Promise.all([
    fetchLivePakistanPrices().catch((error) => ({
      ...REAL_PRICES,
      source: "Fallback static data",
      sourceUrl: null,
      live: false,
      error: error instanceof Error ? error.message : "Failed to load Pakistan fuel prices",
      cache: {
        provider: process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "none",
        status: "fallback",
        hit: false,
        key: "petro:prices:pakistan",
        ttlSeconds: PRICE_CACHE_TTL_SECONDS,
      },
    })),
    fetchLiveBrentCrude().catch((error) => ({
      value: BRENT_CRUDE,
      period: null,
      releaseDate: null,
      source: "Fallback static data",
      sourceUrl: null,
      live: false,
      error: error instanceof Error ? error.message : "Failed to load Brent crude price",
      cache: {
        provider: process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "none",
        status: "fallback",
        hit: false,
        key: "petro:prices:brent",
        ttlSeconds: BRENT_CACHE_TTL_SECONDS,
      },
    })),
    fetchAIFeedItems(),
  ]);
  const cities = generateCityData();
  const critical = cities.filter((city) => city.status === "Critical").length;
  const severe = cities.filter((city) => city.status === "Severe").length;
  const avgAvailability = Math.round(
    cities.reduce((sum, city) => sum + city.availabilityScore, 0) / cities.length
  );

  return {
    generatedAt: new Date().toISOString(),
    prices,
    brentCrude: brent.value,
    brent,
    cities,
    stats: {
      critical,
      severe,
      avgAvailability,
      citiesInCrisis: critical + severe,
      histAvail: [72, 65, 58, 44, 38, 31, avgAvailability],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    feed: {
      items: feed.items,
      sourceLabel: feed.sourceLabel,
      error: feed.feedError,
      cache: feed.cache,
    },
  };
}
