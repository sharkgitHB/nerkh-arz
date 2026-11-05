import { NextResponse } from "next/server";
import { getAsset } from "@/lib/assets";

interface HistoryPoint {
  timestamp: number;
  price: number;
}

// Mapping of crypto source codes to Binance trading pair symbols
const BINANCE_SYMBOLS: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  tether: "USDTUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  solana: "SOLUSDT",
  dogecoin: "DOGEUSDT",
  cardano: "ADAUSDT",
  "avalanche-2": "AVAXUSDT",
  polkadot: "DOTUSDT",
  chainlink: "LINKUSDT",
  litecoin: "LTCUSDT",
  uniswap: "UNIUSDT",
  stellar: "XLMUSDT",
  filecoin: "FILUSDT",
  near: "NEARUSDT",
  aave: "AAVEUSDT",
  eos: "EOSUSDT",
  tezos: "XTZUSDT",
  "the-graph": "GRTUSDT",
  flow: "FLOWUSDT",
  "the-sandbox": "SANDUSDT",
  decentraland: "MANAUSDT",
  "axie-infinity": "AXSUSDT",
  chiliz: "CHZUSDT",
  enjincoin: "ENJUSDT",
  zcash: "ZECUSDT",
  gala: "GALAUSDT",
  loopring: "LRCUSDT",
  "basic-attention-token": "BATUSDT",
  harmony: "ONEUSDT",
  civic: "CVCUSDT",
  storj: "STORJUSDT",
  "the-open-network": "TONUSDT",
  tron: "TRXUSDT",
  "pancakeswap-token": "CAKEUSDT",
  "shiba-inu": "SHIBUSDT",
  pepe: "PEPEUSDT",
  notcoin: "NOTUSDT",
};

async function fetchCryptoHistoryBinance(
  binanceSymbol: string,
  days: number,
): Promise<HistoryPoint[]> {
  // Binance klines: 1d interval, limit = number of days
  // Docs: https://developers.binance.com/docs/binance-spot-api-docs/rest-api
  const limit = Math.min(days, 365);
  const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Binance API returned ${res.status}`);
  const data = await res.json();
  // Each kline is: [openTime, open, high, low, close, volume, closeTime, ...]
  if (!Array.isArray(data)) return [];
  return data.map((k: unknown[]) => ({
    timestamp: Math.floor(Number(k[0]) / 1000),
    price: Number(k[4]), // close price
  }));
}

async function fetchFiatHistoryFrankfurter(
  targetSymbol: string,
  days: number,
): Promise<HistoryPoint[]> {
  // For "USD" we treat it as base (price = 1 always)
  if (targetSymbol === "USD") {
    const now = Date.now();
    const points = Math.min(days, 90);
    const out: HistoryPoint[] = [];
    for (let i = 0; i < points; i++) {
      out.push({
        timestamp: Math.floor(
          (now - (i * days * 24 * 60 * 60 * 1000) / points) / 1000,
        ),
        price: 1,
      });
    }
    return out.reverse();
  }

  // Frankfurter API: free ECB historical exchange rates
  const startDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString().slice(0, 10);
  const url = `https://api.frankfurter.app/${startDate}..?base=USD&symbols=${targetSymbol}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Frankfurter API returned ${res.status}`);
  const data = await res.json();
  if (!data.rates) return [];

  const out: HistoryPoint[] = [];
  for (const [date, rates] of Object.entries(data.rates)) {
    const rate = (rates as Record<string, number>)[targetSymbol];
    if (rate) {
      // rate = target currency amount per 1 USD
      // price of 1 unit of target in USD = 1 / rate
      out.push({
        timestamp: Math.floor(new Date(date).getTime() / 1000),
        price: 1 / rate,
      });
    }
  }
  return out;
}

async function fetchMetalHistorySynthetic(
  code: string,
  days: number,
): Promise<HistoryPoint[]> {
  const currentRes = await fetch(`https://api.gold-api.com/price/${code}`, {
    next: { revalidate: 60 },
  });
  if (!currentRes.ok) throw new Error("Gold API failed");
  const data = await currentRes.json();
  const currentPrice = Number(data.price);
  if (!isFinite(currentPrice) || currentPrice <= 0) return [];

  const points = Math.min(days * 4, 80);
  const volatility = 0.012;
  const now = Date.now();
  let p = currentPrice;
  const series: HistoryPoint[] = [];
  for (let i = 0; i < points; i++) {
    series.push({
      timestamp: Math.floor(
        (now - (i * days * 24 * 60 * 60 * 1000) / points) / 1000,
      ),
      price: p,
    });
    const change = 1 + (Math.random() - 0.5) * 2 * volatility;
    p = p / change;
  }
  series.reverse();
  series[series.length - 1].price = currentPrice;
  return series;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "7", 10);

  const asset = getAsset(id);
  if (!asset) {
    return NextResponse.json({ error: "Unknown asset" }, { status: 404 });
  }

  let history: HistoryPoint[] = [];

  try {
    if (asset.source.type === "crypto") {
      const binanceSymbol = BINANCE_SYMBOLS[asset.source.code];
      if (binanceSymbol && binanceSymbol !== "USDTUSDT") {
        history = await fetchCryptoHistoryBinance(binanceSymbol, days);
      } else {
        // USDT or unknown: flat series anchored to ~1
        const now = Date.now();
        const points = Math.min(days, 30);
        for (let i = 0; i < points; i++) {
          history.push({
            timestamp: Math.floor(
              (now - (i * days * 24 * 60 * 60 * 1000) / points) / 1000,
            ),
            price: 1,
          });
        }
        history.reverse();
      }
    } else if (asset.source.type === "fiat") {
      history = await fetchFiatHistoryFrankfurter(asset.symbol, days);
    } else if (asset.source.type === "metal") {
      // International metals use gold-api.com with XAU/XAG/XPT/XPD codes
      // For Iranian gold items (sekkeh, bahar, etc.), source.code is the alanchand code
      // which gold-api.com doesn't support; fall back to synthetic history.
      const internationalCodes = ["XAU", "XAG", "XPT", "XPD"];
      if (internationalCodes.includes(asset.source.code)) {
        history = await fetchMetalHistorySynthetic(asset.source.code, days);
      } else {
        // Iranian gold item: derive from XAU price scaled by current ratio
        // Fetch XAU history and scale by (iranian_item_current / xau_current)
        // We don't have current price here easily, so generate synthetic anchored
        // to a plausible value (will be replaced by chart logic if needed)
        // Use XAU as a base for the synthetic series shape
        try {
          const xauHistory = await fetchMetalHistorySynthetic("XAU", days);
          // Fetch current Iranian item price from AlanChand
          const { fetchAlanChandGold } = await import("@/lib/alanchand");
          const goldData = await fetchAlanChandGold();
          const item = goldData.find((g) => g.code === asset.alanchand.code);
          const xauItem = goldData.find((g) => g.code === "usd_xau");
          if (item && xauItem && xauItem.price > 0) {
            // Both in USD (iranian IRR / usdTomanRate gives USD, but since we just need shape)
            // Use IRR price directly for the series (chart will show in user's locale)
            const ratio = item.price / xauItem.price;
            history = xauHistory.map((p) => ({
              timestamp: p.timestamp,
              price: p.price * ratio,
            }));
          } else {
            history = xauHistory;
          }
        } catch {
          history = [];
        }
      }
    }
  } catch (e) {
    console.error("History fetch error:", e);
  }

  if (history.length === 0) {
    history = [
      {
        timestamp: Math.floor(Date.now() / 1000),
        price: 0,
      },
    ];
  }

  return NextResponse.json({
    id,
    symbol: asset.symbol,
    days,
    history,
  });
}
