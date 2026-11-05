"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { timeAgo, formatPercent, formatLocalizedPrice } from "@/lib/format";
import { ASSETS, getAssetName, type Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { usePrices } from "./use-prices";
import { AssetIcon } from "./asset-icon";

// Fallback list when the user has no favorites
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

// Section labels per category
const SECTION_LABELS: Record<Asset["category"], { fa: string; en: string }> = {
  currency: { fa: "ارزها", en: "CURRENCY" },
  metal: { fa: "طلا و فلزات", en: "GOLD & METALS" },
  crypto: { fa: "رمزارز", en: "CRYPTO" },
};

/**
 * Compact floating widget rendered inside the dedicated always-on-top
 * Electron window (?widget=1). Transparent window background.
 */
export function WidgetWindow() {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);
  const { data, loading, lastRefresh, refresh } = usePrices(60000);
  const [refreshing, setRefreshing] = useState(false);

  // Transparent page background for the frameless window
  useEffect(() => {
    document.documentElement.classList.add("widget-mode");
    return () => document.documentElement.classList.remove("widget-mode");
  }, []);

  const rows = useMemo(() => {
    const ids = favorites.length > 0 ? favorites : DEFAULT_WIDGET_IDS;
    const list = ids
      .map((id) => ASSETS.find((a) => a.id === id))
      .filter((a): a is Asset => Boolean(a));
    return list.sort(
      (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category],
    );
  }, [favorites]);

  // Group into sections by category
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
    refresh();
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="fixed inset-0 p-1.5">
      <div
        className="h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-foreground"
        style={{
          background:
            "linear-gradient(160deg, rgba(7,19,43,0.94), rgba(12,28,60,0.90))",
          backdropFilter: "blur(20px)",
        }}
        dir={language === "fa" ? "rtl" : "ltr"}
      >
        {/* Header - draggable */}
        <div
          className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-white/10"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
              ₮
            </div>
            <h1 className="text-base font-bold truncate">
              {language === "fa" ? "نرخ ارز" : "Nerkh"}
            </h1>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-white/50 truncate" dir="ltr">
              {loading && !lastRefresh
                ? "…"
                : lastRefresh
                  ? timeAgo(lastRefresh, language)
                  : null}
            </span>
            <button
              onClick={handleRefresh}
              aria-label={t(language, "refresh")}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
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

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3">
          {sections.map((section) => (
            <div key={section.category}>
              <p className="text-[9px] font-bold tracking-widest text-white/40 px-1 mb-1">
                {SECTION_LABELS[section.category][language]}
              </p>
              <div className="space-y-0.5">
                {section.items.map((asset) => (
                  <WidgetRow
                    key={asset.id}
                    asset={asset}
                    price={data[asset.id]}
                  />
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-center text-xs text-white/40 py-8">
              {t(language, "favoritesEmpty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WidgetRow({
  asset,
  price,
}: {
  asset: Asset;
  price?: PriceData;
}) {
  const language = useAppStore((s) => s.language);
  const change = price?.change24h ?? 0;
  const isUp = change > 0;
  const isDown = change < 0;

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
          {getAssetName(asset, language)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold tabular-nums" dir="ltr">
          {price
            ? formatLocalizedPrice(price.price, price.priceIrr, language, {
                compact: price.price > 100000,
              })
            : "—"}
        </span>
        <span
          className={`text-[9px] font-semibold rounded-md px-1 py-0.5 tabular-nums ${
            isUp
              ? "bg-emerald-500/20 text-emerald-300"
              : isDown
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/50"
          }`}
          dir="ltr"
        >
          {formatPercent(change, "en")}
        </span>
      </div>
    </div>
  );
}
