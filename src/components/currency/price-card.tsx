"use client";

import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { formatLocalizedPrice, formatPercent } from "@/lib/format";
import { getAssetName, type Asset } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { AssetIcon } from "./asset-icon";

interface PriceCardProps {
  asset: Asset;
  price?: PriceData;
  onClick: () => void;
}

export function PriceCard({ asset, price, onClick }: PriceCardProps) {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = favorites.includes(asset.id);

  const change = price?.change24h ?? 0;
  const isUp = change >= 0;

  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-start rounded-2xl bg-card border border-border/60 px-4 py-3 flex items-center gap-3 transition-colors hover:bg-accent/40"
    >
      <AssetIcon icon={asset.icon} color={asset.color} size={44} fallback={asset.symbol.charAt(0)} />

      {/* Name & symbol */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate text-[15px]">
          {getAssetName(asset, language)}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="font-mono">{asset.symbol}</span>
          {asset.unitLabel && (
            <>
              <span className="text-muted-foreground/60">·</span>
              <span>{asset.unitLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* Price & change */}
      <div className="flex flex-col items-end gap-0.5 min-w-[120px]">
        <div className="font-semibold text-[15px] tabular-nums">
          {price
            ? formatLocalizedPrice(price.price, price.priceIrr, language)
            : "—"}
        </div>
        {price && (
          <div
            className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${
              isUp ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {formatPercent(change, language)}
          </div>
        )}
      </div>

      {/* Favorite toggle */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(asset.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(asset.id);
          }
        }}
        className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-accent transition-colors cursor-pointer"
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`h-4 w-4 ${
            isFav
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      </span>
    </motion.button>
  );
}
