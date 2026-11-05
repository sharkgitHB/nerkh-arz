import type { Language } from "./i18n";

// Format price with proper locale
export function formatPrice(
  price: number,
  lang: Language,
  options?: { compact?: boolean },
): string {
  if (!isFinite(price) || price === 0) return "—";

  const locale = lang === "fa" ? "fa-IR" : "en-US";

  if (options?.compact && price >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(price);
  }

  // Choose decimals based on price magnitude
  let decimals = 2;
  if (price < 1) decimals = 6;
  else if (price < 10) decimals = 4;
  else if (price < 100) decimals = 3;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * Format asset price with localized currency:
 * - Persian: تومان (1 Toman = 10 Rial, so divide priceIrr by 10)
 * - English: USD ($ prefix)
 *
 * Returns the formatted string WITH the currency unit appended/prefixed.
 */
export function formatLocalizedPrice(
  priceUsd: number,
  priceIrr: number | undefined,
  lang: Language,
  options?: { compact?: boolean },
): string {
  if (!isFinite(priceUsd) || priceUsd === 0) return "—";

  if (lang === "fa") {
    // Persian: convert IRR to Toman (1 Toman = 10 Rial)
    const toman = (priceIrr ?? 0) / 10;
    if (!isFinite(toman) || toman === 0) return "—";

    // For very large Toman values, use compact notation
    if (options?.compact && toman >= 1_000_000) {
      const compact = new Intl.NumberFormat("fa-IR", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(toman);
      return `${compact} تومان`;
    }

    // Regular format with thousands separators
    // Toman prices are typically whole numbers, except for very small ones
    let decimals = 0;
    if (toman < 100) decimals = 2;
    else if (toman < 10000) decimals = 0;

    const num = new Intl.NumberFormat("fa-IR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(toman);
    return `${num} تومان`;
  }

  // English: USD with $ prefix
  let decimals = 2;
  if (priceUsd < 1) decimals = 6;
  else if (priceUsd < 10) decimals = 4;
  else if (priceUsd < 100) decimals = 3;

  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(priceUsd);
  return `$${num}`;
}

/**
 * Returns just the numeric part of the localized price (no currency symbol).
 * Useful when the currency label is shown separately.
 */
export function formatLocalizedNumber(
  priceUsd: number,
  priceIrr: number | undefined,
  lang: Language,
  options?: { compact?: boolean },
): string {
  if (!isFinite(priceUsd) || priceUsd === 0) return "—";

  if (lang === "fa") {
    const toman = (priceIrr ?? 0) / 10;
    if (!isFinite(toman) || toman === 0) return "—";

    if (options?.compact && toman >= 1_000_000) {
      return new Intl.NumberFormat("fa-IR", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(toman);
    }

    let decimals = 0;
    if (toman < 100) decimals = 2;
    else if (toman < 10000) decimals = 0;

    return new Intl.NumberFormat("fa-IR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(toman);
  }

  let decimals = 2;
  if (priceUsd < 1) decimals = 6;
  else if (priceUsd < 10) decimals = 4;
  else if (priceUsd < 100) decimals = 3;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(priceUsd);
}

/**
 * Returns the localized currency unit/symbol based on language.
 * - Persian: "تومان"
 * - English: "$"
 */
export function localizedCurrencyUnit(lang: Language): string {
  return lang === "fa" ? "تومان" : "$";
}

/**
 * Returns the localized currency name based on language.
 * - Persian: "تومان"
 * - English: "USD"
 */
export function localizedCurrencyName(lang: Language): string {
  return lang === "fa" ? "تومان" : "USD";
}

/**
 * Format a USD price using an asset's current USD/IRR rates for conversion.
 * Useful for statistics like 24h high/low that are stored in USD but should
 * be displayed in the user's locale (Toman in Persian, USD in English).
 */
export function formatLocalizedUsdValue(
  usdValue: number,
  assetPriceUsd: number,
  assetPriceIrr: number | undefined,
  lang: Language,
  options?: { compact?: boolean },
): string {
  if (!isFinite(usdValue) || usdValue === 0) return "—";
  // Compute IRR equivalent using the asset's current USD→IRR rate
  const priceIrr =
    assetPriceUsd > 0 && assetPriceIrr
      ? usdValue * (assetPriceIrr / assetPriceUsd)
      : undefined;
  return formatLocalizedPrice(usdValue, priceIrr, lang, options);
}

// Format percentage
export function formatPercent(
  pct: number,
  lang: Language,
): string {
  const locale = lang === "fa" ? "fa-IR" : "en-US";
  const sign = pct > 0 ? "+" : "";
  return (
    sign +
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(pct) +
    "%"
  );
}

// Format large numbers (volume, market cap) in compact form
export function formatCompact(
  value: number,
  lang: Language,
  currency = "USD",
): string {
  if (!isFinite(value) || value === 0) return "—";
  const locale = lang === "fa" ? "fa-IR" : "en-US";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 2,
    style: "currency",
    currency,
  }).format(value);
}

// Persian digits
export function toPersianDigits(s: string | number): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return String(s).replace(/[0-9]/g, (d) => fa[+d]);
}

// Relative time
export function timeAgo(
  date: Date | number,
  lang: Language,
): string {
  const seconds = Math.floor((Date.now() - +date) / 1000);
  if (lang === "fa") {
    if (seconds < 60) return "لحظاتی پیش";
    if (seconds < 3600) return `${toPersianDigits(Math.floor(seconds / 60))} دقیقه پیش`;
    if (seconds < 86400) return `${toPersianDigits(Math.floor(seconds / 3600))} ساعت پیش`;
    return `${toPersianDigits(Math.floor(seconds / 86400))} روز پیش`;
  } else {
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
