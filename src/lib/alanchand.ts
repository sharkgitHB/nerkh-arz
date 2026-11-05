import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

// Convert Persian digits to English
function faToEnDigits(s: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return s.replace(/[۰-۹]/g, (d) => fa.indexOf(d).toString());
}

// Parse a Persian-formatted number like "۲۷۳,۹۰۰" → 273900
function parsePersianNumber(s: string): number {
  const cleaned = faToEnDigits(s).replace(/[,\s]/g, "").trim();
  const n = Number(cleaned);
  return isFinite(n) ? n : 0;
}

interface CurrencyPrice {
  code: string; // usd, eur, aed, ...
  name: string;
  tomanBuy: number;
  tomanSell: number;
  changePercent: number; // positive or negative
  changeDirection: "up" | "down" | "no_change";
}

interface GoldPrice {
  code: string; // sekkeh, bahar, nim, rob, sek, abshodeh, 18ayar, usd_xau, xag, xpt, xpd
  name: string;
  price: number; // numeric price
  currency: "IRR" | "USD"; // IRR for Iranian items, USD for international metals
  changePercent?: number;
}

interface CryptoPrice {
  code: string; // btc, eth, usdt, ...
  persianName: string;
  englishName: string;
  symbol: string;
  tomanPrice: number;
  usdPrice: number;
  tomanChangePercent: number;
  usdChangePercent: number;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Parse change percentage from priceSymbol element
function parseChangePercent(
  $: cheerio.CheerioAPI,
  el: cheerio.Cheerio<AnyNode>,
): { percent: number; direction: "up" | "down" | "no_change" } {
  const $el = $(el);
  // The direction class is on the priceSymbol span itself
  let direction: "up" | "down" | "no_change" = "no_change";
  if ($el.hasClass("up")) direction = "up";
  else if ($el.hasClass("down")) direction = "down";

  // The percentage value is the text content (excluding child elements)
  // For currency rows: "۲۷۳,۹۰۰<span class='priceSymbol up'></span>" - the number is OUTSIDE
  // Actually structure is: <td>۲۷۳,۹۰۰<span class="priceSymbol up"></span></td>
  // The priceSymbol span is empty (just a class indicator)
  // For crypto: <span class="priceSymbol up">۰.۴۶<span class="percentage">%</span></span>
  // The percent value is INSIDE the span

  const text = $el.text().replace(/%/g, "").trim();
  const num = parsePersianNumber(text);
  return { percent: num, direction };
}

// Fetch and parse currency prices (USD, EUR, AED, GBP, TRY, CNY, JPY, INR)
export async function fetchAlanChandCurrencies(): Promise<CurrencyPrice[]> {
  const html = await fetchHtml("https://alanchand.com/currencies-price");
  const $ = cheerio.load(html);
  const out: CurrencyPrice[] = [];

  // Each row is: <tr onclick="window.location='https://alanchand.com/currencies-price/{code}'" ...>
  $('tr[onclick*="/currencies-price/"]').each((_, tr) => {
    const $tr = $(tr);
    const onclick = $tr.attr("onclick") || "";
    const codeMatch = onclick.match(/\/currencies-price\/([a-z-]+)/);
    if (!codeMatch) return;
    const code = codeMatch[1];

    // Skip "usd-hav" (remittance) - we want cash USD only
    if (code.includes("-")) return;

    const name = $tr.find(".currName").text().trim();

    // buyPrice and sellPrice columns
    const buyText = $tr.find(".buyPrice").text().trim();
    const sellText = $tr.find(".sellPrice").text().trim();
    const tomanBuy = parsePersianNumber(buyText);
    const tomanSell = parsePersianNumber(sellText);

    // Change direction from priceSymbol class on sellPrice's span
    let direction: "up" | "down" | "no_change" = "no_change";
    const sellSymbol = $tr.find(".sellPrice .priceSymbol");
    if (sellSymbol.hasClass("up")) direction = "up";
    else if (sellSymbol.hasClass("down")) direction = "down";

    // For currencies, the change percent isn't always shown in the row
    // The "usdRate" column shows cross-rate vs USD which has its own change
    // Use a small random change for now; TODO: fetch individual currency pages if needed
    const changePercent = 0;

    if (tomanSell > 0) {
      out.push({
        code,
        name,
        tomanBuy,
        tomanSell,
        changePercent,
        changeDirection: direction,
      });
    }
  });

  return out;
}

// Fetch and parse gold/coin prices - uses JSON-LD structured data
export async function fetchAlanChandGold(): Promise<GoldPrice[]> {
  const html = await fetchHtml("https://alanchand.com/gold-price");
  const $ = cheerio.load(html);
  const out: GoldPrice[] = [];

  // Find the ItemList JSON-LD
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      const data = JSON.parse($(script).text());
      if (data["@type"] !== "ItemList" || !Array.isArray(data.itemListElement))
        return;

      for (const item of data.itemListElement) {
        const product = item.item;
        if (!product || product["@type"] !== "Product") continue;
        const name = product.name;
        const url = product.url || "";
        const codeMatch = url.match(/\/gold-price\/([a-z0-9_]+)/i);
        const code = codeMatch ? codeMatch[1] : "";
        const offers = product.offers;
        if (!offers) continue;

        const price = Number(offers.price);
        const currency = offers.priceCurrency === "USD" ? "USD" : "IRR";

        if (code && isFinite(price)) {
          out.push({ code, name, price, currency });
        }
      }
    } catch {
      /* ignore JSON parse errors */
    }
  });

  // Also parse the HTML table for change percentages (since JSON-LD doesn't have them)
  $('tr.clickable-row[onclick*="/gold-price/"]').each((_, tr) => {
    const $tr = $(tr);
    const onclick = $tr.attr("onclick") || "";
    const codeMatch = onclick.match(/\/gold-price\/([a-z0-9_]+)/i);
    if (!codeMatch) return;
    const code = codeMatch[1];
    const priceTd = $tr.find(".priceTd");
    const changeSymbol = priceTd.find(".priceSymbol");
    const changeText = changeSymbol.contents().first().text().trim();
    const changePercent = parsePersianNumber(changeText);
    const existing = out.find((p) => p.code === code);
    if (existing) {
      existing.changePercent = changePercent;
    }
  });

  return out;
}

// Fetch and parse crypto prices (BTC, ETH, USDT, BNB, XRP, SOL, DOGE)
export async function fetchAlanChandCrypto(): Promise<CryptoPrice[]> {
  const html = await fetchHtml("https://alanchand.com/crypto-price");
  const $ = cheerio.load(html);
  const out: CryptoPrice[] = [];

  $('tr[onclick*="/crypto-price/"]').each((_, tr) => {
    const $tr = $(tr);
    const onclick = $tr.attr("onclick") || "";
    const codeMatch = onclick.match(/\/crypto-price\/([a-z0-9]+)/i);
    if (!codeMatch) return;
    const code = codeMatch[1];

    const persianName = $tr.find(".faCurr").text().trim();
    const englishName = $tr.find(".enCurr").text().trim();
    const symbol = $tr.find(".symbolCurr").text().trim();

    // Toman price and change
    const tomanText = $tr.find(".perTmn .tmn").text().trim();
    const tomanPrice = parsePersianNumber(tomanText);
    // Toman change percent
    const tomanChangeSymbol = $tr.find(".perTmn .priceSymbol");
    const tomanChangeText = tomanChangeSymbol.contents().first().text().trim();
    const tomanChangePercent = parsePersianNumber(tomanChangeText);

    // USD price and change
    const usdText = $tr.find(".perUsd .dlr").text().trim();
    const usdPrice = parsePersianNumber(usdText);
    const usdChangeSymbol = $tr.find(".perUsd .priceSymbol");
    const usdChangeText = usdChangeSymbol.contents().first().text().trim();
    const usdChangePercent = parsePersianNumber(usdChangeText);

    if (tomanPrice > 0 || usdPrice > 0) {
      out.push({
        code,
        persianName,
        englishName,
        symbol,
        tomanPrice,
        usdPrice,
        tomanChangePercent,
        usdChangePercent,
      });
    }
  });

  return out;
}

// Get all prices in one fetch (parallel)
export async function fetchAllAlanChandPrices(): Promise<{
  currencies: CurrencyPrice[];
  gold: GoldPrice[];
  crypto: CryptoPrice[];
  errors: string[];
}> {
  const errors: string[] = [];
  const results = await Promise.allSettled([
    fetchAlanChandCurrencies(),
    fetchAlanChandGold(),
    fetchAlanChandCrypto(),
  ]);

  const currencies =
    results[0].status === "fulfilled"
      ? results[0].value
      : (errors.push(`Currencies: ${(results[0].reason as Error).message}`),
        []);
  const gold =
    results[1].status === "fulfilled"
      ? results[1].value
      : (errors.push(`Gold: ${(results[1].reason as Error).message}`), []);
  const crypto =
    results[2].status === "fulfilled"
      ? results[2].value
      : (errors.push(`Crypto: ${(results[2].reason as Error).message}`), []);

  return { currencies, gold, crypto, errors };
}
