"use client";

import { useMemo, useState } from "react";
import { Calculator as CalcIcon, ArrowLeftRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import type { Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";

interface CalculatorProps {
  asset: Asset;
  price?: PriceData;
}

export function Calculator({ asset, price }: CalculatorProps) {
  const language = useAppStore((s) => s.language);
  const [amount, setAmount] = useState("1");
  // Direction is always asset <-> local currency (Toman in Persian, USD in English)
  const [direction, setDirection] = useState<"asset-to-local" | "local-to-asset">(
    "asset-to-local",
  );

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const usdPrice = price?.price ?? 0;
  const irrPrice = price?.priceIrr ?? 0;
  // Toman price = IRR price / 10
  const tomanPrice = irrPrice / 10;

  // In Persian mode we use Toman, in English mode we use USD
  const isPersian = language === "fa";
  const localUnit = isPersian ? "تومان" : "USD";
  // Local currency price per 1 unit of asset
  const localPricePerUnit = isPersian ? tomanPrice : usdPrice;

  const result = useMemo(() => {
    if (!localPricePerUnit) return null;
    if (direction === "asset-to-local") {
      return numAmount * localPricePerUnit;
    } else {
      return numAmount / localPricePerUnit;
    }
  }, [numAmount, localPricePerUnit, direction]);

  // Quick amounts - different scales for Toman vs USD
  const quickAmounts = isPersian
    ? ["1", "10", "100", "1000"]
    : ["1", "10", "100", "1000"];

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-3">
      <div className="flex items-center gap-2 mb-3">
        <CalcIcon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{t(language, "calculator")}</h3>
      </div>

      {/* Direction toggle */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex-1 text-xs font-medium px-2.5 h-7 rounded-full flex items-center justify-center"
          style={{
            background:
              direction === "asset-to-local" ? "var(--primary)" : "var(--muted)",
            color:
              direction === "asset-to-local"
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
          }}
        >
          {asset.symbol} → {localUnit}
        </div>
        <button
          onClick={() =>
            setDirection(
              direction === "asset-to-local" ? "local-to-asset" : "asset-to-local",
            )
          }
          className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="swap"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>
        <div
          className="flex-1 text-xs font-medium px-2.5 h-7 rounded-full flex items-center justify-center"
          style={{
            background:
              direction === "local-to-asset" ? "var(--primary)" : "var(--muted)",
            color:
              direction === "local-to-asset"
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
          }}
        >
          {localUnit} → {asset.symbol}
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl bg-muted/60 p-3 mb-2">
        <label className="text-[11px] text-muted-foreground block mb-1">
          {t(language, "amount")} (
          {direction === "asset-to-local" ? asset.symbol : localUnit})
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          className="w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
          placeholder="0"
          dir="ltr"
        />
      </div>

      {/* Result */}
      <div className="rounded-xl bg-primary/10 p-3">
        <label className="text-[11px] text-muted-foreground block mb-1">
          {t(language, "result")} (
          {direction === "asset-to-local" ? localUnit : asset.symbol})
        </label>
        <div className="text-lg font-bold tabular-nums" dir="ltr">
          {result == null
            ? "—"
            : direction === "asset-to-local"
              ? // Result is in local currency
                isPersian
                ? `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(result)} تومان`
                : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result)}`
              : // Result is in asset units
                `${formatPrice(result, language)} ${asset.symbol}`}
        </div>
      </div>

      {/* Quick amounts */}
      <div className="no-scrollbar overflow-x-auto -mx-1 px-1 mt-3">
        <div className="flex gap-1.5 min-w-max">
          {quickAmounts.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="px-3 h-7 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors"
              dir="ltr"
            >
              {isPersian
                ? new Intl.NumberFormat("fa-IR").format(Number(v))
                : v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
