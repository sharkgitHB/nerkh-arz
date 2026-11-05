"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatLocalizedPrice, formatLocalizedUsdValue, formatPercent, formatCompact } from "@/lib/format";
import { getAssetName, type Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { Calculator } from "./calculator";
import { AssetIcon } from "./asset-icon";

interface DetailSheetProps {
  asset: Asset | null;
  price?: PriceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RANGES = [
  { days: 7, key: "7d" as const },
  { days: 30, key: "30d" as const },
  { days: 90, key: "90d" as const },
  { days: 365, key: "1y" as const },
];

interface HistoryPoint {
  timestamp: number;
  price: number;
}

interface HistoryResponse {
  id: string;
  symbol: string;
  days: number;
  history: HistoryPoint[];
}

async function fetchHistory(
  assetId: string,
  days: number,
): Promise<HistoryResponse> {
  const res = await fetch(`/api/history/${assetId}?days=${days}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function DetailSheet({
  asset,
  price,
  open,
  onOpenChange,
}: DetailSheetProps) {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = asset ? favorites.includes(asset.id) : false;

  const [range, setRange] = useState(7);

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ["history", asset?.id, range],
    queryFn: () => fetchHistory(asset!.id, range),
    enabled: !!asset && open,
    staleTime: 5 * 60 * 1000,
  });

  const history = historyData?.history ?? [];

  if (!asset) return null;

  const change = price?.change24h ?? 0;
  const isUp = change >= 0;
  const chartColor = isUp ? "#22c55e" : "#ef4444";

  const chartData = history.map((h) => ({
    timestamp: h.timestamp * 1000,
    price: h.price,
    label: new Date(h.timestamp * 1000).toLocaleDateString(
      language === "fa" ? "fa-IR" : "en-US",
      { month: "short", day: "numeric" },
    ),
  }));

  const minPrice = history.length
    ? Math.min(...history.map((h) => h.price))
    : 0;
  const maxPrice = history.length
    ? Math.max(...history.map((h) => h.price))
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-2xl rounded-t-3xl p-0 gap-0 max-h-[92vh] overflow-y-auto"
      >
        {/* Pull indicator */}
        <div className="sticky top-0 z-10 bg-background pt-2 pb-1 flex justify-center">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="px-5 pt-3 pb-3 space-y-0 text-start">
          <div className="flex items-center gap-3">
            <AssetIcon icon={asset.icon} color={asset.color} size={48} fallback={asset.symbol.charAt(0)} />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">{getAssetName(asset, language)}</SheetTitle>
              <SheetDescription className="font-mono">
                {asset.symbol}
                {asset.unitLabel && ` · ${asset.unitLabel}`}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(asset.id)}
              className="rounded-full h-10 w-10"
            >
              <Star
                className={`h-5 w-5 ${
                  isFav ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </SheetHeader>

        {/* Price block */}
        <div className="px-5 py-3">
          <div className="text-4xl font-bold tabular-nums tracking-tight">
            {price
              ? formatLocalizedPrice(price.price, price.priceIrr, language)
              : "—"}
          </div>
          {price && (
            <div
              className={`inline-flex items-center gap-1 mt-1.5 text-sm font-medium tabular-nums ${
                isUp ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatPercent(change, language)}
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-muted-foreground">{t(language, "24h")}</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="px-5">
          <div className="rounded-2xl bg-card border border-border/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">{t(language, "priceChart")}</h3>
            </div>

            {/* Range selector */}
            <div className="no-scrollbar overflow-x-auto -mx-1 px-1 mb-2">
              <div className="flex gap-1.5 min-w-max">
                {RANGES.map((r) => (
                  <button
                    key={r.days}
                    onClick={() => setRange(r.days)}
                    className="px-3 h-7 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background:
                        range === r.days ? "var(--primary)" : "var(--muted)",
                      color:
                        range === r.days
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {t(language, r.key)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart area */}
            <div className="h-44 -mx-2">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t(language, "loading")}
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={language === "fa" ? 70 : 50}
                      tickFormatter={(v) =>
                        price
                          ? formatLocalizedUsdValue(
                              v,
                              price.price,
                              price.priceIrr,
                              language,
                              { compact: true },
                            )
                          : ""
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "var(--muted-foreground)" }}
                      formatter={(value: number) =>
                        price
                          ? [
                              formatLocalizedUsdValue(
                                value,
                                price.price,
                                price.priceIrr,
                                language,
                              ),
                              t(language, "price"),
                            ]
                          : ["—", ""]
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t(language, "noData")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {price && (
          <div className="px-5 py-3">
            <h3 className="text-sm font-semibold mb-2">{t(language, "statistics")}</h3>
            <div className="grid grid-cols-2 gap-2">
              <StatRow
                label={t(language, "high24h")}
                value={
                  price.high24h
                    ? formatLocalizedUsdValue(
                        price.high24h,
                        price.price,
                        price.priceIrr,
                        language,
                      )
                    : "—"
                }
              />
              <StatRow
                label={t(language, "low24h")}
                value={
                  price.low24h
                    ? formatLocalizedUsdValue(
                        price.low24h,
                        price.price,
                        price.priceIrr,
                        language,
                      )
                    : "—"
                }
              />
              <StatRow
                label={t(language, "volume24h")}
                value={price.volume24h ? formatCompact(price.volume24h, language) : "—"}
              />
              <StatRow
                label={t(language, "marketCap")}
                value={price.marketCap ? formatCompact(price.marketCap, language) : "—"}
              />
              <StatRow
                label={`${t(language, "high")} (${t(language, range === 365 ? "1y" : range === 90 ? "90d" : range === 30 ? "30d" : "7d")})`}
                value={
                  maxPrice
                    ? formatLocalizedUsdValue(
                        maxPrice,
                        price.price,
                        price.priceIrr,
                        language,
                      )
                    : "—"
                }
              />
              <StatRow
                label={`${t(language, "low")} (${t(language, range === 365 ? "1y" : range === 90 ? "90d" : range === 30 ? "30d" : "7d")})`}
                value={
                  minPrice
                    ? formatLocalizedUsdValue(
                        minPrice,
                        price.price,
                        price.priceIrr,
                        language,
                      )
                    : "—"
                }
              />
            </div>
          </div>
        )}

        {/* Calculator */}
        <div className="px-5 pb-6">
          <Calculator asset={asset} price={price} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border/60 px-3 py-2">
      <div className="text-[11px] text-muted-foreground truncate">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5 truncate">{value}</div>
    </div>
  );
}
