"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import { ASSETS, getAssetName, type Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { usePrices } from "./use-prices";
import { AssetIcon } from "./asset-icon";

// Fallback list when the user has no favorites — mirrors the reference design
const DEFAULT_WIDGET_IDS = [
  "usd",
  "eur",
  "gold_18ayar",
  "emami_coin",
  "btc",
  "eth",
  "usdt",
];

const CATEGORY_ORDER: Record<string, number> = {
  currency: 0,
  metal: 1,
  crypto: 2,
};

const SECTION_LABELS: Record<Asset["category"], { fa: string; en: string }> = {
  currency: { fa: "ارزها", en: "CURRENCY" },
  metal: { fa: "طلا و فلزات", en: "GOLD & METALS" },
  crypto: { fa: "رمزارز", en: "CRYPTO" },
};

// Assets quoted in Iranian Toman (fiat + Iranian gold/coins); the rest in USD
const TOMAN_IDS = new Set([
  "abshodeh",
  "gold_18ayar",
  "emami_coin",
  "azadi_coin",
  "half_azadi",
  "quarter_azadi",
  "gram_coin",
]);

function isTomanQuoted(asset: Asset): boolean {
  return asset.category === "currency" || TOMAN_IDS.has(asset.id);
}

function formatWidgetPrice(
  asset: Asset,
  price: PriceData | undefined,
  lang: "fa" | "en",
): { text: string; suffix: string } {
  if (!price) return { text: "—", suffix: "" };
  const locale = lang === "fa" ? "fa-IR" : "en-US";
  if (isTomanQuoted(asset)) {
    const toman = (price.priceIrr ?? 0) / 10;
    const num = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Math.round(toman));
    return { text: num, suffix: lang === "fa" ? "ت" : "T" };
  }
  const usd = price.price;
  let decimals = 0;
  if (usd < 1) decimals = 4;
  else if (usd < 100) decimals = 2;
  const num = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(usd);
  return { text: num, suffix: "$" };
}

function ChangeBadge({ change }: { change: number }) {
  const cls =
    change > 0
      ? "bg-emerald-500/25 text-emerald-300"
      : change < 0
        ? "bg-red-500/25 text-red-300"
        : "bg-white/10 text-white/50";
  const text =
    change === 0
      ? "0%"
      : (change > 0 ? "+" : "") +
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(change) +
        "%";
  return (
    <span
      className={`text-[9px] font-semibold rounded-md px-1.5 py-0.5 tabular-nums flex-shrink-0 ${cls}`}
      dir="ltr"
    >
      {text}
    </span>
  );
}

export interface WidgetPanelProps {
  prices: Record<string, PriceData>;
  loading: boolean;
  lastRefresh: number;
  onRefresh: () => void;
}

/**
 * The compact price widget panel — shared by the Electron always-on-top
 * window (?widget=1) and the browser Document PiP window.
 * Design follows the reference: Nerkh-style grouped desktop widget.
 */
export function WidgetPanel({
  prices,
  loading,
  lastRefresh,
  onRefresh,
}: WidgetPanelProps) {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => {
    const ids = favorites.length > 0 ? favorites : DEFAULT_WIDGET_IDS;
    const list = ids
      .map((id) => ASSETS.find((a) => a.id === id))
      .filter((a): a is Asset => Boolean(a));
    return list.sort(
      (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
    );
  }, [favorites]);

  const sections = useMemo(() => {
    const out: Array<{ category: Asset["category"]; items: Asset[] }> = [];
    for (const a of rows) {
      const last = out[out.length - 1];
      if (last && last.category === a.category) last.items.push(a);
      else out.push({ category: a.category, items: [a] });
    }
    return out;
  }, [rows]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div
      className="h-full flex flex-col text-foreground"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      {/* Header — draggable in the Electron widget window */}
      <div
        className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <h1 className="text-lg font-extrabold tracking-tight">
          {language === "fa" ? "نرخ ارز" : "Nerkh"}
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-white/50" dir="ltr">
            {loading && !lastRefresh
              ? "…"
              : lastRefresh
                ? `${timeAgo(lastRefresh, language)}`
                : null}
          </span>
          <button
            onClick={handleRefresh}
            aria-label="refresh"
            className="h-8 w-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-white/80 ${
                refreshing || loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Grouped rows */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 widget-scroll">
        {sections.map((section) => (
          <div key={section.category}>
            <p className="text-[9px] font-bold tracking-[0.18em] text-white/40 px-1 mb-1.5">
              {SECTION_LABELS[section.category][language]}
            </p>
            <div className="space-y-1">
              {section.items.map((asset) => (
                <WidgetRow
                  key={asset.id}
                  asset={asset}
                  price={prices[asset.id]}
                  lang={language}
                />
              ))}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-center text-xs text-white/40 py-8">—</p>
        )}
      </div>
    </div>
  );
}

function WidgetRow({
  asset,
  price,
  lang,
}: {
  asset: Asset;
  price?: PriceData;
  lang: "fa" | "en";
}) {
  const language = useAppStore((s) => s.language);
  const change = price?.change24h ?? 0;
  const { text, suffix } = formatWidgetPrice(asset, price, language);

  return (
    <div className="flex items-center gap-2.5 rounded-xl hover:bg-white/5 transition-colors px-1.5 py-1.5">
      <AssetIcon
        icon={asset.icon}
        color={asset.color}
        size={26}
        fallback={asset.symbol.charAt(0)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {getAssetName(asset, lang)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold tabular-nums" dir="ltr">
          {text}
          {suffix && (
            <span className="text-white/50 font-semibold"> {suffix}</span>
          )}
        </span>
        <ChangeBadge change={change} />
      </div>
    </div>
  );
}

/**
 * Standalone page wrapper for the Electron widget window (?widget=1).
 * Owns its own price fetching; transparent background for the frameless window.
 */
export function WidgetWindow() {
  const { data, loading, lastRefresh, refresh } = usePrices(60000);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("widget-mode");
    return () => document.documentElement.classList.remove("widget-mode");
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="fixed inset-0 p-1.5">
      <div
        className="h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(7,19,43,0.94), rgba(12,28,60,0.90))",
          backdropFilter: "blur(20px)",
        }}
      >
        <WidgetPanel
          prices={data}
          loading={loading}
          lastRefresh={lastRefresh}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
