import { NextResponse } from "next/server";
import { ASSETS, type Asset } from "@/lib/assets";
import { fetchAllAlanChandPrices } from "@/lib/alanchand";

export interface PriceData {
  id: string;
  price: number; // price in USD per 1 unit
  change24h: number; // percentage
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  priceIrr: number; // price in IRR per 1 unit (Iranian free market rate)
  source: "alanchand" | "fallback";
}

interface FetchResult {
  prices: Record<string, PriceData>;
  timestamp: number;
  errors: string[];
  source: string;
}

// === Fallback data sources (used if AlanChand fails) ===

async function fetchFiatRatesFallback(): Promise<Record<string, number>> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Fiat API returned ${res.status}`);
  const data = await res.json();
  if (!data.rates) throw new Error("Invalid fiat response");
  return data.rates as Record<string, number>;
}

async function fetchCryptoFallback(
  coinIds: string[],
): Promise<
  Record<string, { usd: number; change: number; vol: number; cap: number }>
> {
  if (coinIds.length === 0) return {};
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    `?ids=${coinIds.join(",")}` +
    "&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true";
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`CoinGecko API returned ${res.status}`);
  const data = await res.json();
  const out: Record<
    string,
    { usd: number; change: number; vol: number; cap: number }
  > = {};
  for (const [id, val] of Object.entries(data)) {
    const v = val as {
      usd: number;
      usd_24h_change: number;
      usd_24h_vol: number;
      usd_market_cap: number;
    };
    out[id] = {
      usd: v.usd,
      change: v.usd_24h_change ?? 0,
      vol: v.usd_24h_vol ?? 0,
      cap: v.usd_market_cap ?? 0,
    };
  }
  return out;
}

async function fetchMetalFallback(code: string): Promise<number> {
  const res = await fetch(`https://api.gold-api.com/price/${code}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Gold API returned ${res.status}`);
  const data = await res.json();
  const price = Number(data.price);
  if (!isFinite(price)) throw new Error("Invalid metal price");
  return price;
}

// === Build PriceData from AlanChand data ===

function buildPriceFromAlanChand(
  asset: Asset,
  acData: Awaited<ReturnType<typeof fetchAllAlanChandPrices>>,
  usdTomanRate: number, // 1 USD = N Toman (from AlanChand USD row)
): PriceData | null {
  if (!asset.alanchand) return null;
  const { page, code, perUnits } = asset.alanchand;
  const usdIrrRate = usdTomanRate * 10; // 1 USD = N*10 IRR (Toman → IRR)

  if (page === "currency") {
    const cur = acData.currencies.find((c) => c.code === code);
    if (!cur) return null;
    // alanchand returns Toman price for 1 unit of currency (or perUnits if specified)
    // For USD itself: tomanSell IS the USD/Toman rate
    const tomanPerUnit = perUnits
      ? cur.tomanSell / perUnits
      : cur.tomanSell;
    const irrPerUnit = tomanPerUnit * 10;
    // For USD: priceUsd = 1, priceIrr = usdIrrRate
    // For other currencies: priceUsd = irrPerUnit / usdIrrRate
    const priceUsd = asset.id === "usd" ? 1 : irrPerUnit / usdIrrRate;
    // Change percent: AlanChand only gives direction (up/down/no_change)
    // For now use 0; we could fetch individual currency pages for exact %
    const changeSign =
      cur.changeDirection === "up"
        ? 0.5
        : cur.changeDirection === "down"
          ? -0.5
          : 0;
    return {
      id: asset.id,
      price: priceUsd,
      change24h: changeSign,
      high24h: null,
      low24h: null,
      volume24h: null,
      marketCap: null,
      priceIrr: irrPerUnit,
      source: "alanchand",
    };
  }

  if (page === "gold") {
    const item = acData.gold.find((g) => g.code === code);
    if (!item) return null;
    if (item.currency === "IRR") {
      // Iranian gold/coin: price is in IRR per 1 unit
      const priceIrr = item.price;
      const priceUsd = priceIrr / usdIrrRate;
      return {
        id: asset.id,
        price: priceUsd,
        change24h: item.changePercent ?? 0,
        high24h: null,
        low24h: null,
        volume24h: null,
        marketCap: null,
        priceIrr,
        source: "alanchand",
      };
    } else {
      // International metal (XAU, XAG, XPT, XPD): price is in USD per 1 ounce
      const priceUsd = item.price;
      const priceIrr = priceUsd * usdIrrRate;
      return {
        id: asset.id,
        price: priceUsd,
        change24h: item.changePercent ?? 0,
        high24h: null,
        low24h: null,
        volume24h: null,
        marketCap: null,
        priceIrr,
        source: "alanchand",
      };
    }
  }

  if (page === "crypto") {
    const c = acData.crypto.find((x) => x.code === code);
    if (!c) return null;
    // AlanChand crypto: tomanPrice (per 1 unit), usdPrice (per 1 unit)
    const priceUsd = c.usdPrice > 0 ? c.usdPrice : 1;
    const priceIrr = c.tomanPrice * 10;
    return {
      id: asset.id,
      price: priceUsd,
      change24h: c.tomanChangePercent || c.usdChangePercent || 0,
      high24h: null,
      low24h: null,
      volume24h: null,
      marketCap: null,
      priceIrr,
      source: "alanchand",
    };
  }

  return null;
}

export async function GET() {
  const errors: string[] = [];
  const result: Record<string, PriceData> = {};
  let primarySource: "alanchand" | "fallback" = "alanchand";

  // Try AlanChand first (real Iranian free market rates)
  let acData: Awaited<ReturnType<typeof fetchAllAlanChandPrices>> | null = null;
  try {
    acData = await fetchAllAlanChandPrices();
    if (acData.errors.length > 0) {
      errors.push(...acData.errors);
    }
  } catch (e) {
    errors.push(`AlanChand: ${(e as Error).message}`);
  }

  // Find USD/Toman rate from AlanChand
  let usdTomanRate = 27000; // fallback
  if (acData) {
    const usdCur = acData.currencies.find((c) => c.code === "usd");
    if (usdCur && usdCur.tomanSell > 0) {
      usdTomanRate = usdCur.tomanSell;
    }
  }

  // Build prices from AlanChand for assets that have alanchand mapping
  if (acData) {
    for (const asset of ASSETS) {
      const price = buildPriceFromAlanChand(asset, acData, usdTomanRate);
      if (price) {
        result[asset.id] = price;
      }
    }
  }

  // For any asset missing from AlanChand (or if AlanChand failed entirely),
  // fall back to the old APIs. Using the fallback is expected behavior for
  // assets AlanChand doesn't list (e.g., UAH), so it's not counted as an error.
  const missingAssets = ASSETS.filter((a) => !result[a.id]);
  if (missingAssets.length > 0) {
    primarySource = "fallback";

    // === Fallback: Fiat currencies ===
    const fiatAssets = missingAssets.filter((a) => a.source.type === "fiat");
    if (fiatAssets.length > 0) {
      try {
        const rates = await fetchFiatRatesFallback();
        // er-api's IRR is the official (government) rate, far from the Iranian
        // free market. Keep AlanChand's free-market USD rate when available and
        // only fall back to the official rate if AlanChand failed entirely.
        if (!acData) {
          const irrRate = rates.IRR || 1 / 42000;
          usdTomanRate = irrRate / 10; // IRR rate per USD / 10 = Toman per USD
        }
        for (const asset of fiatAssets) {
          const usdRate = rates[asset.source.code];
          if (!usdRate) continue;
          const priceInUsd = asset.id === "usd" ? 1 : 1 / usdRate;
          result[asset.id] = {
            id: asset.id,
            price: priceInUsd,
            change24h: 0,
            high24h: null,
            low24h: null,
            volume24h: null,
            marketCap: null,
            priceIrr: priceInUsd * usdTomanRate * 10,
            source: "fallback",
          };
        }
      } catch (e) {
        errors.push(`Fiat fallback: ${(e as Error).message}`);
      }
    }

    // === Fallback: Crypto ===
    const cryptoAssets = missingAssets.filter((a) => a.source.type === "crypto");
    if (cryptoAssets.length > 0) {
      try {
        const cryptoData = await fetchCryptoFallback(
          cryptoAssets.map((a) => a.source.code),
        );
        for (const asset of cryptoAssets) {
          const d = cryptoData[asset.source.code];
          if (!d) continue;
          result[asset.id] = {
            id: asset.id,
            price: d.usd,
            change24h: d.change,
            high24h: null,
            low24h: null,
            volume24h: d.vol,
            marketCap: d.cap,
            priceIrr: d.usd * usdTomanRate * 10,
            source: "fallback",
          };
        }
      } catch (e) {
        errors.push(`Crypto fallback: ${(e as Error).message}`);
      }
    }

    // === Fallback: Metals ===
    const metalAssets = missingAssets.filter((a) => a.source.type === "metal");
    if (metalAssets.length > 0) {
      const uniqueCodes = Array.from(
        new Set(metalAssets.map((a) => a.source.code)),
      );
      const metalResults = await Promise.allSettled(
        uniqueCodes.map((code) => fetchMetalFallback(code)),
      );
      const metalPrices: Record<string, number> = {};
      uniqueCodes.forEach((code, i) => {
        const r = metalResults[i];
        if (r.status === "fulfilled") metalPrices[code] = r.value;
        else errors.push(`Metal ${code}: ${(r.reason as Error)?.message}`);
      });
      for (const asset of metalAssets) {
        if (asset.derivedFrom) {
          const base = result[asset.derivedFrom.assetId];
          if (!base) continue;
          result[asset.id] = {
            id: asset.id,
            price: base.price * asset.derivedFrom.multiplier,
            change24h: base.change24h,
            high24h: null,
            low24h: null,
            volume24h: null,
            marketCap: null,
            priceIrr: base.priceIrr * asset.derivedFrom.multiplier,
            source: "fallback",
          };
        } else {
          const p = metalPrices[asset.source.code];
          if (!p) continue;
          result[asset.id] = {
            id: asset.id,
            price: p,
            change24h: 0,
            high24h: null,
            low24h: null,
            volume24h: null,
            marketCap: null,
            priceIrr: p * usdTomanRate * 10,
            source: "fallback",
          };
        }
      }
    }
  }

  const payload: FetchResult = {
    prices: result,
    timestamp: Date.now(),
    errors,
    source: primarySource,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=30",
    },
  });
}
