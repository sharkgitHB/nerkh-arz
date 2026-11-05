// Asset registry - all assets from AlanChand (alanchand.com)
// Includes 38 currencies, 11 gold/coins, 40 cryptocurrencies

export type AssetCategory = "currency" | "metal" | "crypto";

// Icon type - either a flag emoji, an SVG component key, an image URL, or a letter
export type IconType =
  | { kind: "emoji"; value: string }
  | { kind: "svg"; key: string } // key into SVG_MAP in asset-icon.tsx
  | { kind: "image"; url: string } // direct image URL (e.g., AlanChand crypto/gold icons)
  | { kind: "letter"; value: string };

export interface Asset {
  id: string;
  symbol: string;
  // Direct Persian & English names (no translation keys needed)
  nameFa: string;
  nameEn: string;
  category: AssetCategory;
  source: {
    type: "fiat" | "crypto" | "metal";
    code: string;
  };
  // AlanChand source mapping (preferred - real Iranian market rates)
  alanchand: {
    page: "currency" | "gold" | "crypto";
    code: string;
    // For currencies: some alanchand entries are per-100 (e.g., jpy = "100 yen")
    perUnits?: number;
  };
  // Optional derived pricing: price = base asset price × multiplier
  // (used by the rates API fallback for metals without a direct source)
  derivedFrom?: { assetId: string; multiplier: number };
  icon: IconType;
  color: string;
  unitLabel?: "ounce" | "gram" | "coin" | "unit";
}

// Helper to get localized asset name
export function getAssetName(asset: Asset, lang: "fa" | "en"): string {
  return lang === "fa" ? asset.nameFa : asset.nameEn;
}

// Build a local crypto icon URL (served from /public/crypto —
// sourced from AlanChand & Nobitex, bundled for offline/desktop use)
function acCrypto(code: string): string {
  return `/crypto/${code}.svg`;
}

// Build an AlanChand image URL for gold
function acGold(code: string): string {
  return `https://alanchand.com/assets/img/gold/${code}.jpg`;
}

// === Currencies (38 total) - flag emoji icons ===
const CURRENCY_ASSETS: Omit<Asset, "category">[] = [
  { id: "usd", symbol: "USD", nameFa: "دلار آمریکا", nameEn: "US Dollar", source: { type: "fiat", code: "USD" }, alanchand: { page: "currency", code: "usd" }, icon: { kind: "emoji", value: "🇺🇸" }, color: "#22c55e", unitLabel: "unit" },
  { id: "eur", symbol: "EUR", nameFa: "یورو", nameEn: "Euro", source: { type: "fiat", code: "EUR" }, alanchand: { page: "currency", code: "eur" }, icon: { kind: "emoji", value: "🇪🇺" }, color: "#3b82f6", unitLabel: "unit" },
  { id: "aed", symbol: "AED", nameFa: "درهم امارات", nameEn: "UAE Dirham", source: { type: "fiat", code: "AED" }, alanchand: { page: "currency", code: "aed" }, icon: { kind: "emoji", value: "🇦🇪" }, color: "#0ea5e9", unitLabel: "unit" },
  { id: "gbp", symbol: "GBP", nameFa: "پوند انگلیس", nameEn: "British Pound", source: { type: "fiat", code: "GBP" }, alanchand: { page: "currency", code: "gbp" }, icon: { kind: "emoji", value: "🇬🇧" }, color: "#6366f1", unitLabel: "unit" },
  { id: "try", symbol: "TRY", nameFa: "لیر ترکیه", nameEn: "Turkish Lira", source: { type: "fiat", code: "TRY" }, alanchand: { page: "currency", code: "try" }, icon: { kind: "emoji", value: "🇹🇷" }, color: "#ef4444", unitLabel: "unit" },
  { id: "cny", symbol: "CNY", nameFa: "یوان چین", nameEn: "Chinese Yuan", source: { type: "fiat", code: "CNY" }, alanchand: { page: "currency", code: "cny" }, icon: { kind: "emoji", value: "🇨🇳" }, color: "#dc2626", unitLabel: "unit" },
  { id: "cad", symbol: "CAD", nameFa: "دلار کانادا", nameEn: "Canadian Dollar", source: { type: "fiat", code: "CAD" }, alanchand: { page: "currency", code: "cad" }, icon: { kind: "emoji", value: "🇨🇦" }, color: "#f97316", unitLabel: "unit" },
  { id: "aud", symbol: "AUD", nameFa: "دلار استرالیا", nameEn: "Australian Dollar", source: { type: "fiat", code: "AUD" }, alanchand: { page: "currency", code: "aud" }, icon: { kind: "emoji", value: "🇦🇺" }, color: "#0ea5e9", unitLabel: "unit" },
  { id: "rub", symbol: "RUB", nameFa: "روبل روسیه", nameEn: "Russian Ruble", source: { type: "fiat", code: "RUB" }, alanchand: { page: "currency", code: "rub" }, icon: { kind: "emoji", value: "🇷🇺" }, color: "#1e40af", unitLabel: "unit" },
  { id: "iqd", symbol: "IQD", nameFa: "دینار عراق", nameEn: "Iraqi Dinar", source: { type: "fiat", code: "IQD" }, alanchand: { page: "currency", code: "iqd", perUnits: 100 }, icon: { kind: "emoji", value: "🇮🇶" }, color: "#84cc16", unitLabel: "unit" },
  { id: "myr", symbol: "MYR", nameFa: "رینگیت مالزی", nameEn: "Malaysian Ringgit", source: { type: "fiat", code: "MYR" }, alanchand: { page: "currency", code: "myr" }, icon: { kind: "emoji", value: "🇲🇾" }, color: "#dc2626", unitLabel: "unit" },
  { id: "gel", symbol: "GEL", nameFa: "لاری گرجستان", nameEn: "Georgian Lari", source: { type: "fiat", code: "GEL" }, alanchand: { page: "currency", code: "gel" }, icon: { kind: "emoji", value: "🇬🇪" }, color: "#0ea5e9", unitLabel: "unit" },
  { id: "azn", symbol: "AZN", nameFa: "منات آذربایجان", nameEn: "Azerbaijani Manat", source: { type: "fiat", code: "AZN" }, alanchand: { page: "currency", code: "azn" }, icon: { kind: "emoji", value: "🇦🇿" }, color: "#16a34a", unitLabel: "unit" },
  { id: "amd", symbol: "AMD", nameFa: "درام ارمنستان", nameEn: "Armenian Dram", source: { type: "fiat", code: "AMD" }, alanchand: { page: "currency", code: "amd", perUnits: 100 }, icon: { kind: "emoji", value: "🇦🇲" }, color: "#d97706", unitLabel: "unit" },
  { id: "thb", symbol: "THB", nameFa: "بات تایلند", nameEn: "Thai Baht", source: { type: "fiat", code: "THB" }, alanchand: { page: "currency", code: "thb" }, icon: { kind: "emoji", value: "🇹🇭" }, color: "#7c3aed", unitLabel: "unit" },
  { id: "omr", symbol: "OMR", nameFa: "ریال عمان", nameEn: "Omani Rial", source: { type: "fiat", code: "OMR" }, alanchand: { page: "currency", code: "omr" }, icon: { kind: "emoji", value: "🇴🇲" }, color: "#15803d", unitLabel: "unit" },
  { id: "inr", symbol: "INR", nameFa: "روپیه هند", nameEn: "Indian Rupee", source: { type: "fiat", code: "INR" }, alanchand: { page: "currency", code: "inr" }, icon: { kind: "emoji", value: "🇮🇳" }, color: "#f97316", unitLabel: "unit" },
  { id: "pkr", symbol: "PKR", nameFa: "روپیه پاکستان", nameEn: "Pakistani Rupee", source: { type: "fiat", code: "PKR" }, alanchand: { page: "currency", code: "pkr" }, icon: { kind: "emoji", value: "🇵🇰" }, color: "#15803d", unitLabel: "unit" },
  { id: "jpy", symbol: "JPY", nameFa: "ین ژاپن", nameEn: "Japanese Yen", source: { type: "fiat", code: "JPY" }, alanchand: { page: "currency", code: "jpy", perUnits: 100 }, icon: { kind: "emoji", value: "🇯🇵" }, color: "#f43f5e", unitLabel: "unit" },
  { id: "sar", symbol: "SAR", nameFa: "ریال عربستان", nameEn: "Saudi Riyal", source: { type: "fiat", code: "SAR" }, alanchand: { page: "currency", code: "sar" }, icon: { kind: "emoji", value: "🇸🇦" }, color: "#15803d", unitLabel: "unit" },
  { id: "afn", symbol: "AFN", nameFa: "افغانی", nameEn: "Afghan Afghani", source: { type: "fiat", code: "AFN" }, alanchand: { page: "currency", code: "afn" }, icon: { kind: "emoji", value: "🇦🇫" }, color: "#16a34a", unitLabel: "unit" },
  { id: "sek", symbol: "SEK", nameFa: "کرون سوئد", nameEn: "Swedish Krona", source: { type: "fiat", code: "SEK" }, alanchand: { page: "currency", code: "sek" }, icon: { kind: "emoji", value: "🇸🇪" }, color: "#1e40af", unitLabel: "unit" },
  { id: "chf", symbol: "CHF", nameFa: "فرانک سوئیس", nameEn: "Swiss Franc", source: { type: "fiat", code: "CHF" }, alanchand: { page: "currency", code: "chf" }, icon: { kind: "emoji", value: "🇨🇭" }, color: "#ef4444", unitLabel: "unit" },
  { id: "qar", symbol: "QAR", nameFa: "ریال قطر", nameEn: "Qatari Riyal", source: { type: "fiat", code: "QAR" }, alanchand: { page: "currency", code: "qar" }, icon: { kind: "emoji", value: "🇶🇦" }, color: "#7c3aed", unitLabel: "unit" },
  { id: "krw", symbol: "KRW", nameFa: "وون کره جنوبی", nameEn: "South Korean Won", source: { type: "fiat", code: "KRW" }, alanchand: { page: "currency", code: "krw", perUnits: 100 }, icon: { kind: "emoji", value: "🇰🇷" }, color: "#1e40af", unitLabel: "unit" },
  { id: "nok", symbol: "NOK", nameFa: "کرون نروژ", nameEn: "Norwegian Krone", source: { type: "fiat", code: "NOK" }, alanchand: { page: "currency", code: "nok" }, icon: { kind: "emoji", value: "🇳🇴" }, color: "#0ea5e9", unitLabel: "unit" },
  { id: "nzd", symbol: "NZD", nameFa: "دلار نیوزلند", nameEn: "New Zealand Dollar", source: { type: "fiat", code: "NZD" }, alanchand: { page: "currency", code: "nzd" }, icon: { kind: "emoji", value: "🇳🇿" }, color: "#0ea5e9", unitLabel: "unit" },
  { id: "sgd", symbol: "SGD", nameFa: "دلار سنگاپور", nameEn: "Singapore Dollar", source: { type: "fiat", code: "SGD" }, alanchand: { page: "currency", code: "sgd" }, icon: { kind: "emoji", value: "🇸🇬" }, color: "#dc2626", unitLabel: "unit" },
  { id: "hkd", symbol: "HKD", nameFa: "دلار هنگ کنگ", nameEn: "Hong Kong Dollar", source: { type: "fiat", code: "HKD" }, alanchand: { page: "currency", code: "hkd" }, icon: { kind: "emoji", value: "🇭🇰" }, color: "#dc2626", unitLabel: "unit" },
  { id: "kwd", symbol: "KWD", nameFa: "دینار کویت", nameEn: "Kuwaiti Dinar", source: { type: "fiat", code: "KWD" }, alanchand: { page: "currency", code: "kwd" }, icon: { kind: "emoji", value: "🇰🇼" }, color: "#16a34a", unitLabel: "unit" },
  { id: "dkk", symbol: "DKK", nameFa: "کرون دانمارک", nameEn: "Danish Krone", source: { type: "fiat", code: "DKK" }, alanchand: { page: "currency", code: "dkk" }, icon: { kind: "emoji", value: "🇩🇰" }, color: "#1e40af", unitLabel: "unit" },
  { id: "bhd", symbol: "BHD", nameFa: "دینار بحرین", nameEn: "Bahraini Dinar", source: { type: "fiat", code: "BHD" }, alanchand: { page: "currency", code: "bhd" }, icon: { kind: "emoji", value: "🇧🇭" }, color: "#dc2626", unitLabel: "unit" },
  { id: "tjs", symbol: "TJS", nameFa: "سامانی تاجیکستان", nameEn: "Tajikistani Somoni", source: { type: "fiat", code: "TJS" }, alanchand: { page: "currency", code: "tjs" }, icon: { kind: "emoji", value: "🇹🇯" }, color: "#15803d", unitLabel: "unit" },
  { id: "tmt", symbol: "TMT", nameFa: "منات ترکمنستان", nameEn: "Turkmenistani Manat", source: { type: "fiat", code: "TMT" }, alanchand: { page: "currency", code: "tmt" }, icon: { kind: "emoji", value: "🇹🇲" }, color: "#16a34a", unitLabel: "unit" },
  { id: "kgs", symbol: "KGS", nameFa: "سوم قرقیزستان", nameEn: "Kyrgyzstani Som", source: { type: "fiat", code: "KGS" }, alanchand: { page: "currency", code: "kgs" }, icon: { kind: "emoji", value: "🇰🇬" }, color: "#dc2626", unitLabel: "unit" },
  { id: "syp", symbol: "SYP", nameFa: "پوند سوریه", nameEn: "Syrian Pound", source: { type: "fiat", code: "SYP" }, alanchand: { page: "currency", code: "syp", perUnits: 100 }, icon: { kind: "emoji", value: "🇸🇾" }, color: "#dc2626", unitLabel: "unit" },
  { id: "brl", symbol: "BRL", nameFa: "رئال برزیل", nameEn: "Brazilian Real", source: { type: "fiat", code: "BRL" }, alanchand: { page: "currency", code: "brl" }, icon: { kind: "emoji", value: "🇧🇷" }, color: "#16a34a", unitLabel: "unit" },
  { id: "ars", symbol: "ARS", nameFa: "پزو آرژانتین", nameEn: "Argentine Peso", source: { type: "fiat", code: "ARS" }, alanchand: { page: "currency", code: "ars" }, icon: { kind: "emoji", value: "🇦🇷" }, color: "#0ea5e9", unitLabel: "unit" },
  // Not listed on AlanChand - priced via the fiat fallback API (open.er-api.com)
  { id: "uah", symbol: "UAH", nameFa: "هریونیا اوکراین", nameEn: "Ukrainian Hryvnia", source: { type: "fiat", code: "UAH" }, alanchand: { page: "currency", code: "uah" }, icon: { kind: "emoji", value: "🇺🇦" }, color: "#2563eb", unitLabel: "unit" },
];

// === Precious Metals & Iranian Gold Coins (11 total) ===
const METAL_ASSETS: Omit<Asset, "category">[] = [
  // Iranian gold (in IRR - free market Iran price)
  { id: "abshodeh", symbol: "ABSH", nameFa: "آبشده (مثقال طلا)", nameEn: "Melted Gold (Mithqal)", source: { type: "metal", code: "abshodeh" }, alanchand: { page: "gold", code: "abshodeh" }, icon: { kind: "image", url: acGold("abshodeh") }, color: "#f59e0b", unitLabel: "gram" },
  { id: "gold_18ayar", symbol: "G18", nameFa: "گرم طلای ۱۸ عیار", nameEn: "18K Gold (gram)", source: { type: "metal", code: "18ayar" }, alanchand: { page: "gold", code: "18ayar" }, icon: { kind: "image", url: acGold("18ayar") }, color: "#f59e0b", unitLabel: "gram" },
  { id: "emami_coin", symbol: "EMAMI", nameFa: "سکه امامی (طرح جدید)", nameEn: "Emami Coin", source: { type: "metal", code: "sekkeh" }, alanchand: { page: "gold", code: "sekkeh" }, icon: { kind: "image", url: acGold("sekkeh") }, color: "#d4af37", unitLabel: "coin" },
  { id: "azadi_coin", symbol: "AZADI", nameFa: "سکه بهار آزادی", nameEn: "Azadi Coin", source: { type: "metal", code: "bahar" }, alanchand: { page: "gold", code: "bahar" }, icon: { kind: "image", url: acGold("bahar") }, color: "#c9a227", unitLabel: "coin" },
  { id: "half_azadi", symbol: "½AZADI", nameFa: "نیم سکه", nameEn: "Half Azadi Coin", source: { type: "metal", code: "nim" }, alanchand: { page: "gold", code: "nim" }, icon: { kind: "image", url: acGold("SekehNim") }, color: "#b8860b", unitLabel: "coin" },
  { id: "quarter_azadi", symbol: "¼AZADI", nameFa: "ربع سکه", nameEn: "Quarter Azadi Coin", source: { type: "metal", code: "rob" }, alanchand: { page: "gold", code: "rob" }, icon: { kind: "image", url: acGold("rob") }, color: "#a78b3a", unitLabel: "coin" },
  { id: "gram_coin", symbol: "SEK", nameFa: "سکه گرمی", nameEn: "Gram Coin", source: { type: "metal", code: "sek" }, alanchand: { page: "gold", code: "sek" }, icon: { kind: "image", url: acGold("SekehGram") }, color: "#a78b3a", unitLabel: "coin" },
  // International metals (in USD per troy ounce)
  { id: "gold_ounce", symbol: "XAU", nameFa: "انس طلا", nameEn: "Gold Ounce", source: { type: "metal", code: "XAU" }, alanchand: { page: "gold", code: "usd_xau" }, icon: { kind: "svg", key: "goldIngot" }, color: "#f59e0b", unitLabel: "ounce" },
  { id: "silver_ounce", symbol: "XAG", nameFa: "انس نقره", nameEn: "Silver Ounce", source: { type: "metal", code: "XAG" }, alanchand: { page: "gold", code: "xag" }, icon: { kind: "svg", key: "silverIngot" }, color: "#94a3b8", unitLabel: "ounce" },
  { id: "platinum", symbol: "XPT", nameFa: "انس پلاتین", nameEn: "Platinum Ounce", source: { type: "metal", code: "XPT" }, alanchand: { page: "gold", code: "xpt" }, icon: { kind: "svg", key: "platinum" }, color: "#a8a8a8", unitLabel: "ounce" },
  { id: "palladium", symbol: "XPD", nameFa: "انس پالادیوم", nameEn: "Palladium Ounce", source: { type: "metal", code: "XPD" }, alanchand: { page: "gold", code: "xpd" }, icon: { kind: "svg", key: "palladium" }, color: "#10b981", unitLabel: "ounce" },
  { id: "rhodium", symbol: "XRH", nameFa: "انس رودیوم", nameEn: "Rhodium Ounce", source: { type: "metal", code: "XRH" }, alanchand: { page: "gold", code: "xrh" }, icon: { kind: "svg", key: "palladium" }, color: "#e5e7eb", unitLabel: "ounce" },
];

// === Cryptocurrencies (40 total) - using AlanChand SVG icons ===
const CRYPTO_ASSETS: Omit<Asset, "category">[] = [
  { id: "btc", symbol: "BTC", nameFa: "بیت کوین", nameEn: "Bitcoin", source: { type: "crypto", code: "bitcoin" }, alanchand: { page: "crypto", code: "btc" }, icon: { kind: "image", url: acCrypto("btc") }, color: "#f7931a", unitLabel: "unit" },
  { id: "eth", symbol: "ETH", nameFa: "اتریوم", nameEn: "Ethereum", source: { type: "crypto", code: "ethereum" }, alanchand: { page: "crypto", code: "eth" }, icon: { kind: "image", url: acCrypto("eth") }, color: "#627eea", unitLabel: "unit" },
  { id: "usdt", symbol: "USDT", nameFa: "تتر", nameEn: "Tether", source: { type: "crypto", code: "tether" }, alanchand: { page: "crypto", code: "usdt" }, icon: { kind: "image", url: acCrypto("usdt") }, color: "#26a17b", unitLabel: "unit" },
  { id: "bnb", symbol: "BNB", nameFa: "بایننس کوین", nameEn: "Binance Coin", source: { type: "crypto", code: "binancecoin" }, alanchand: { page: "crypto", code: "bnb" }, icon: { kind: "image", url: acCrypto("bnb") }, color: "#f3ba2f", unitLabel: "unit" },
  { id: "xrp", symbol: "XRP", nameFa: "ریپل", nameEn: "Ripple", source: { type: "crypto", code: "ripple" }, alanchand: { page: "crypto", code: "xrp" }, icon: { kind: "image", url: acCrypto("xrp") }, color: "#23292f", unitLabel: "unit" },
  { id: "sol", symbol: "SOL", nameFa: "سولانا", nameEn: "Solana", source: { type: "crypto", code: "solana" }, alanchand: { page: "crypto", code: "sol" }, icon: { kind: "image", url: acCrypto("sol") }, color: "#9945ff", unitLabel: "unit" },
  { id: "doge", symbol: "DOGE", nameFa: "دوج کوین", nameEn: "Dogecoin", source: { type: "crypto", code: "dogecoin" }, alanchand: { page: "crypto", code: "doge" }, icon: { kind: "image", url: acCrypto("doge") }, color: "#c2a633", unitLabel: "unit" },
  { id: "ada", symbol: "ADA", nameFa: "کاردانو", nameEn: "Cardano", source: { type: "crypto", code: "cardano" }, alanchand: { page: "crypto", code: "ada" }, icon: { kind: "image", url: acCrypto("ada") }, color: "#0033ad", unitLabel: "unit" },
  { id: "avax", symbol: "AVAX", nameFa: "آوالانچ", nameEn: "Avalanche", source: { type: "crypto", code: "avalanche-2" }, alanchand: { page: "crypto", code: "avax" }, icon: { kind: "image", url: acCrypto("avax") }, color: "#e84142", unitLabel: "unit" },
  { id: "dot", symbol: "DOT", nameFa: "پولکادوت", nameEn: "Polkadot", source: { type: "crypto", code: "polkadot" }, alanchand: { page: "crypto", code: "dot" }, icon: { kind: "image", url: acCrypto("dot") }, color: "#e6007a", unitLabel: "unit" },
  { id: "link", symbol: "LINK", nameFa: "چین لینک", nameEn: "Chainlink", source: { type: "crypto", code: "chainlink" }, alanchand: { page: "crypto", code: "link" }, icon: { kind: "image", url: acCrypto("link") }, color: "#2a5ada", unitLabel: "unit" },
  { id: "ltc", symbol: "LTC", nameFa: "لایت کوین", nameEn: "Litecoin", source: { type: "crypto", code: "litecoin" }, alanchand: { page: "crypto", code: "ltc" }, icon: { kind: "image", url: acCrypto("ltc") }, color: "#345d9d", unitLabel: "unit" },
  { id: "uni", symbol: "UNI", nameFa: "یونی سواپ", nameEn: "Uniswap", source: { type: "crypto", code: "uniswap" }, alanchand: { page: "crypto", code: "uni" }, icon: { kind: "image", url: acCrypto("uni") }, color: "#ff007a", unitLabel: "unit" },
  { id: "xlm", symbol: "XLM", nameFa: "استلار", nameEn: "Stellar", source: { type: "crypto", code: "stellar" }, alanchand: { page: "crypto", code: "xlm" }, icon: { kind: "image", url: acCrypto("xlm") }, color: "#14b6e7", unitLabel: "unit" },
  { id: "fil", symbol: "FIL", nameFa: "فایل کوین", nameEn: "Filecoin", source: { type: "crypto", code: "filecoin" }, alanchand: { page: "crypto", code: "fil" }, icon: { kind: "image", url: acCrypto("fil") }, color: "#0096ff", unitLabel: "unit" },
  { id: "near", symbol: "NEAR", nameFa: "نیر پروتکل", nameEn: "NEAR Protocol", source: { type: "crypto", code: "near" }, alanchand: { page: "crypto", code: "near" }, icon: { kind: "image", url: acCrypto("near") }, color: "#2ecc71", unitLabel: "unit" },
  { id: "aave", symbol: "AAVE", nameFa: "آوه", nameEn: "Aave", source: { type: "crypto", code: "aave" }, alanchand: { page: "crypto", code: "aave" }, icon: { kind: "image", url: acCrypto("aave") }, color: "#b6509e", unitLabel: "unit" },
  { id: "eos", symbol: "EOS", nameFa: "ایاس", nameEn: "EOS", source: { type: "crypto", code: "eos" }, alanchand: { page: "crypto", code: "eos" }, icon: { kind: "image", url: acCrypto("eos") }, color: "#000000", unitLabel: "unit" },
  { id: "xtz", symbol: "XTZ", nameFa: "تزوس", nameEn: "Tezos", source: { type: "crypto", code: "tezos" }, alanchand: { page: "crypto", code: "xtz" }, icon: { kind: "image", url: acCrypto("xtz") }, color: "#2c7df7", unitLabel: "unit" },
  { id: "grt", symbol: "GRT", nameFa: "د گراف", nameEn: "The Graph", source: { type: "crypto", code: "the-graph" }, alanchand: { page: "crypto", code: "grt" }, icon: { kind: "image", url: acCrypto("grt") }, color: "#6747ed", unitLabel: "unit" },
  { id: "flow", symbol: "FLOW", nameFa: "فلو", nameEn: "Flow", source: { type: "crypto", code: "flow" }, alanchand: { page: "crypto", code: "flow" }, icon: { kind: "image", url: acCrypto("flow") }, color: "#00ff8f", unitLabel: "unit" },
  { id: "sand", symbol: "SAND", nameFa: "د سندباکس", nameEn: "The Sandbox", source: { type: "crypto", code: "the-sandbox" }, alanchand: { page: "crypto", code: "sand" }, icon: { kind: "image", url: acCrypto("sand") }, color: "#00adef", unitLabel: "unit" },
  { id: "mana", symbol: "MANA", nameFa: "دسنترالند", nameEn: "Decentraland", source: { type: "crypto", code: "decentraland" }, alanchand: { page: "crypto", code: "mana" }, icon: { kind: "image", url: acCrypto("mana") }, color: "#ff2d55", unitLabel: "unit" },
  { id: "axs", symbol: "AXS", nameFa: "اکسی اینفینیتی", nameEn: "Axie Infinity", source: { type: "crypto", code: "axie-infinity" }, alanchand: { page: "crypto", code: "axs" }, icon: { kind: "image", url: acCrypto("axs") }, color: "#0055d4", unitLabel: "unit" },
  { id: "chz", symbol: "CHZ", nameFa: "چیلیز", nameEn: "Chiliz", source: { type: "crypto", code: "chiliz" }, alanchand: { page: "crypto", code: "chz" }, icon: { kind: "image", url: acCrypto("chz") }, color: "#cd0124", unitLabel: "unit" },
  { id: "enj", symbol: "ENJ", nameFa: "انجین کوین", nameEn: "Enjin Coin", source: { type: "crypto", code: "enjincoin" }, alanchand: { page: "crypto", code: "enj" }, icon: { kind: "image", url: acCrypto("enj") }, color: "#624dbf", unitLabel: "unit" },
  { id: "zec", symbol: "ZEC", nameFa: "زد کش", nameEn: "Zcash", source: { type: "crypto", code: "zcash" }, alanchand: { page: "crypto", code: "zec" }, icon: { kind: "image", url: acCrypto("zec") }, color: "#f4b728", unitLabel: "unit" },
  { id: "gala", symbol: "GALA", nameFa: "گالا", nameEn: "Gala", source: { type: "crypto", code: "gala" }, alanchand: { page: "crypto", code: "gala" }, icon: { kind: "image", url: acCrypto("gala") }, color: "#0a1929", unitLabel: "unit" },
  { id: "lrc", symbol: "LRC", nameFa: "لوپرینگ", nameEn: "Loopring", source: { type: "crypto", code: "loopring" }, alanchand: { page: "crypto", code: "lrc" }, icon: { kind: "image", url: acCrypto("lrc") }, color: "#1c60ff", unitLabel: "unit" },
  { id: "bat", symbol: "BAT", nameFa: "بیسیک اتنشن توکن", nameEn: "Basic Attention Token", source: { type: "crypto", code: "basic-attention-token" }, alanchand: { page: "crypto", code: "bat" }, icon: { kind: "image", url: acCrypto("bat") }, color: "#9e1f63", unitLabel: "unit" },
  { id: "one", symbol: "ONE", nameFa: "هارمونی", nameEn: "Harmony", source: { type: "crypto", code: "harmony" }, alanchand: { page: "crypto", code: "one" }, icon: { kind: "image", url: acCrypto("one") }, color: "#00aee9", unitLabel: "unit" },
  { id: "zen", symbol: "ZEN", nameFa: "هورایزن", nameEn: "Horizen", source: { type: "crypto", code: "zcash" }, alanchand: { page: "crypto", code: "zen" }, icon: { kind: "image", url: acCrypto("zen") }, color: "#25a6da", unitLabel: "unit" },
  { id: "cvc", symbol: "CVC", nameFa: "سیویک", nameEn: "Civic", source: { type: "crypto", code: "civic" }, alanchand: { page: "crypto", code: "cvc" }, icon: { kind: "image", url: acCrypto("cvc") }, color: "#3ae7e1", unitLabel: "unit" },
  { id: "storj", symbol: "STORJ", nameFa: "استورج", nameEn: "Storj", source: { type: "crypto", code: "storj" }, alanchand: { page: "crypto", code: "storj" }, icon: { kind: "image", url: acCrypto("storj") }, color: "#00bfff", unitLabel: "unit" },
  { id: "ton", symbol: "TON", nameFa: "تون کوین", nameEn: "Toncoin", source: { type: "crypto", code: "the-open-network" }, alanchand: { page: "crypto", code: "ton" }, icon: { kind: "image", url: acCrypto("ton") }, color: "#0098ea", unitLabel: "unit" },
  { id: "trx", symbol: "TRX", nameFa: "ترون", nameEn: "TRON", source: { type: "crypto", code: "tron" }, alanchand: { page: "crypto", code: "trx" }, icon: { kind: "image", url: acCrypto("trx") }, color: "#ff060a", unitLabel: "unit" },
  { id: "cake", symbol: "CAKE", nameFa: "پنکیک سواپ", nameEn: "PancakeSwap", source: { type: "crypto", code: "pancakeswap-token" }, alanchand: { page: "crypto", code: "cake" }, icon: { kind: "image", url: acCrypto("cake") }, color: "#d1884f", unitLabel: "unit" },
  { id: "shib", symbol: "SHIB", nameFa: "شیبا اینو", nameEn: "Shiba Inu", source: { type: "crypto", code: "shiba-inu" }, alanchand: { page: "crypto", code: "shib" }, icon: { kind: "image", url: acCrypto("shib") }, color: "#f00500", unitLabel: "unit" },
  { id: "pepe", symbol: "PEPE", nameFa: "پپه", nameEn: "Pepe", source: { type: "crypto", code: "pepe" }, alanchand: { page: "crypto", code: "pepe" }, icon: { kind: "image", url: acCrypto("pepe") }, color: "#3d9c3d", unitLabel: "unit" },
  { id: "not", symbol: "NOT", nameFa: "نات کوین", nameEn: "Notcoin", source: { type: "crypto", code: "notcoin" }, alanchand: { page: "crypto", code: "not" }, icon: { kind: "image", url: acCrypto("not") }, color: "#ffd659", unitLabel: "unit" },
];

// Country flag for each fiat currency (local SVGs served from /public/flags).
// Flag emojis are not rendered on Windows, so we use real flag images instead.
const CURRENCY_FLAG: Record<string, string> = {
  usd: "us", eur: "eu", aed: "ae", gbp: "gb", try: "tr", cny: "cn",
  cad: "ca", aud: "au", rub: "ru", iqd: "iq", myr: "my", gel: "ge",
  azn: "az", amd: "am", thb: "th", omr: "om", inr: "in", pkr: "pk",
  jpy: "jp", sar: "sa", afn: "af", sek: "se", chf: "ch", qar: "qa",
  krw: "kr", nok: "no", nzd: "nz", sgd: "sg", hkd: "hk", kwd: "kw",
  dkk: "dk", bhd: "bh", tjs: "tj", tmt: "tm", kgs: "kg", syp: "sy",
  brl: "br", ars: "ar", uah: "ua",
};

// Override fiat currency icons with local flag images
for (const a of CURRENCY_ASSETS) {
  const cc = CURRENCY_FLAG[a.id];
  if (cc) a.icon = { kind: "image", url: `/flags/${cc}.svg` };
}

// Combine all assets
export const ASSETS: Asset[] = [
  ...CURRENCY_ASSETS.map((a) => ({ ...a, category: "currency" as const })),
  ...METAL_ASSETS.map((a) => ({ ...a, category: "metal" as const })),
  ...CRYPTO_ASSETS.map((a) => ({ ...a, category: "crypto" as const })),
];

export const ASSET_MAP: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a]),
);

export function getAsset(id: string): Asset | undefined {
  return ASSET_MAP[id];
}
