"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, ChevronDown, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatLocalizedPrice } from "@/lib/format";
import { ASSETS, getAssetName, type Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { AssetIcon } from "./asset-icon";

interface ConverterProps {
  prices: Record<string, PriceData>;
  loading: boolean;
}

// Popular conversion pairs (asset ids)
const QUICK_PAIRS: Array<[string, string]> = [
  ["usd", "eur"],
  ["usd", "try"],
  ["usd", "aed"],
  ["usd", "btc"],
  ["eur", "usd"],
  ["usdt", "usd"],
];

const QUICK_AMOUNTS = ["1", "10", "100", "1000", "10000"];

// Adaptive decimal count for conversion results
function convertDecimals(n: number): number {
  if (n >= 1000) return 0;
  if (n >= 10) return 2;
  if (n >= 1) return 3;
  if (n >= 0.01) return 4;
  return 6;
}

function formatAmount(n: number, lang: "fa" | "en"): string {
  if (!isFinite(n) || n === 0) return "0";
  return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits: convertDecimals(n),
  }).format(n);
}

export function Converter({ prices, loading }: ConverterProps) {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);

  const [fromId, setFromId] = useState("usd");
  const [toId, setToId] = useState("eur");
  const [amount, setAmount] = useState("1");
  const [pickerSide, setPickerSide] = useState<"from" | "to" | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");

  const fromAsset = ASSETS.find((a) => a.id === fromId)!;
  const toAsset = ASSETS.find((a) => a.id === toId)!;
  const fromPrice = prices[fromId];
  const toPrice = prices[toId];

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;

  // Cross rate via USD: amount -> USD -> target
  const result = useMemo(() => {
    if (!fromPrice?.price || !toPrice?.price) return null;
    return (numAmount * fromPrice.price) / toPrice.price;
  }, [numAmount, fromPrice?.price, toPrice?.price]);

  // Toman/USD value of the input amount (for the secondary line)
  const inputValue = useMemo(() => {
    if (!fromPrice) return null;
    if (language === "fa") {
      return fromPrice.priceIrr ? (numAmount * fromPrice.priceIrr) / 10 : null;
    }
    return numAmount * fromPrice.price;
  }, [numAmount, fromPrice, language]);

  const rate = useMemo(() => {
    if (!fromPrice?.price || !toPrice?.price) return null;
    return fromPrice.price / toPrice.price;
  }, [fromPrice?.price, toPrice?.price]);

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const pickAsset = (id: string) => {
    if (pickerSide === "from") setFromId(id);
    else if (pickerSide === "to") setToId(id);
    setPickerSide(null);
    setPickerQuery("");
  };

  const pickerAssets = useMemo(() => {
    let list = ASSETS;
    if (pickerQuery.trim()) {
      const q = pickerQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          getAssetName(a, language).toLowerCase().includes(q) ||
          a.nameFa.toLowerCase().includes(q) ||
          a.nameEn.toLowerCase().includes(q),
      );
    }
    // Favorites first, then by category order
    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      const order = { currency: 0, metal: 1, crypto: 2 };
      return order[a.category] - order[b.category];
    });
  }, [pickerQuery, language, favorites]);

  const AssetButton = ({ side }: { side: "from" | "to" }) => {
    const asset: Asset = side === "from" ? fromAsset : toAsset;
    return (
      <button
        onClick={() => setPickerSide(side)}
        className="flex items-center gap-2 rounded-full bg-muted/80 hover:bg-accent transition-colors ps-1 pe-2.5 py-1 min-h-9"
      >
        <AssetIcon
          icon={asset.icon}
          color={asset.color}
          size={28}
          fallback={asset.symbol.charAt(0)}
        />
        <span className="text-sm font-semibold" dir="ltr">
          {asset.symbol}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
        {/* From */}
        <div className="rounded-2xl bg-muted/50 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">
              {t(language, "amount")} · {t(language, "from")}
            </span>
            <AssetButton side="from" />
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="w-full bg-transparent text-2xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/40"
            placeholder="0"
            dir="ltr"
          />
          {inputValue != null && inputValue > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              ≈{" "}
              {language === "fa"
                ? `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(inputValue)} تومان`
                : `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(inputValue)}`}
            </p>
          )}
        </div>

        {/* Swap */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwap}
            aria-label={t(language, "swap")}
            title={t(language, "swap")}
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* To */}
        <div className="rounded-2xl bg-primary/10 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">
              {t(language, "youGet")}
            </span>
            <AssetButton side="to" />
          </div>
          <div
            className="text-2xl font-bold tabular-nums min-h-9 flex items-center"
            dir="ltr"
          >
            {loading && !result
              ? "…"
              : result == null
                ? "—"
                : formatAmount(result, language)}
          </div>
        </div>

        {/* Rate */}
        {rate != null && (
          <div className="rounded-xl bg-muted/40 px-3.5 py-2.5 space-y-1" dir="ltr">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t(language, "rate")}</span>
              <span className="font-semibold tabular-nums">
                1 {fromAsset.symbol} = {formatAmount(rate, language)}{" "}
                {toAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t(language, "inverseRate")}
              </span>
              <span className="font-semibold tabular-nums">
                1 {toAsset.symbol} = {formatAmount(1 / rate, language)}{" "}
                {fromAsset.symbol}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick amounts */}
      <div className="no-scrollbar overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`px-3 h-7 rounded-full text-xs font-medium transition-colors ${
                amount === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              dir="ltr"
            >
              {new Intl.NumberFormat(
                language === "fa" ? "fa-IR" : "en-US",
              ).format(Number(v))}
            </button>
          ))}
        </div>
      </div>

      {/* Quick pairs */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground px-1">
          {t(language, "quickPairs")}
        </p>
        <div className="no-scrollbar overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max">
            {QUICK_PAIRS.map(([f, to]) => {
              const fa = ASSETS.find((a) => a.id === f);
              const ta = ASSETS.find((a) => a.id === to);
              if (!fa || !ta) return null;
              const active = fromId === f && toId === to;
              return (
                <button
                  key={`${f}-${to}`}
                  onClick={() => {
                    setFromId(f);
                    setToId(to);
                  }}
                  className={`flex items-center gap-1 px-2.5 h-8 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border/60 hover:bg-accent"
                  }`}
                  dir="ltr"
                >
                  {fa.symbol}
                  <ArrowLeftRight className="h-3 w-3 opacity-60" />
                  {ta.symbol}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset picker sheet */}
      <Sheet open={pickerSide !== null} onOpenChange={(o) => !o && setPickerSide(null)}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-2xl rounded-t-3xl p-0 gap-0 max-h-[80vh] flex flex-col"
        >
          <div className="pt-2 flex justify-center">
            <div className="h-1 w-9 rounded-full bg-muted-foreground/30" />
          </div>
          <SheetHeader className="px-5 pt-2 pb-2 space-y-1 text-start">
            <SheetTitle className="text-base">{t(language, "selectAsset")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t(language, "converterHint")}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder={t(language, "searchAsset")}
                className="w-full h-10 rounded-xl bg-muted/60 ps-9 pe-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {pickerAssets.map((a) => {
              const p = prices[a.id];
              const isSelected =
                pickerSide === "from" ? a.id === fromId : a.id === toId;
              return (
                <button
                  key={a.id}
                  onClick={() => pickAsset(a.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-accent/60"
                  }`}
                >
                  <AssetIcon
                    icon={a.icon}
                    color={a.color}
                    size={36}
                    fallback={a.symbol.charAt(0)}
                  />
                  <div className="flex-1 text-start min-w-0">
                    <div className="text-sm font-medium truncate">
                      {getAssetName(a, language)}
                    </div>
                    <div className="text-[11px] text-muted-foreground" dir="ltr">
                      {a.symbol}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums text-end">
                    {p
                      ? formatLocalizedPrice(p.price, p.priceIrr, language, {
                          compact: true,
                        })
                      : "—"}
                  </div>
                </button>
              );
            })}
            {pickerAssets.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t(language, "noData")}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
