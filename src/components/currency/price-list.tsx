"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ASSETS, getAssetName } from "@/lib/assets";
import type { PriceData } from "@/app/api/rates/route";
import { PriceCard } from "./price-card";
import { motion } from "framer-motion";

interface PriceListProps {
  prices: Record<string, PriceData>;
  loading: boolean;
  onSelectAsset: (id: string) => void;
}

export function PriceList({ prices, loading, onSelectAsset }: PriceListProps) {
  const language = useAppStore((s) => s.language);
  const activeTab = useAppStore((s) => s.activeTab);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const favorites = useAppStore((s) => s.favorites);

  const filteredAssets = useMemo(() => {
    let list = ASSETS;

    if (activeTab === "favorites") {
      list = list.filter((a) => favorites.includes(a.id));
    } else if (activeTab === "currencies") {
      list = list.filter((a) => a.category === "currency");
    } else if (activeTab === "metals") {
      list = list.filter((a) => a.category === "metal");
    } else if (activeTab === "crypto") {
      list = list.filter((a) => a.category === "crypto");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          getAssetName(a, language).toLowerCase().includes(q) ||
          a.nameFa.toLowerCase().includes(q) ||
          a.nameEn.toLowerCase().includes(q),
      );
    }

    // Sort: favorites first, then by price (desc)
    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      const aPrice = prices[a.id]?.price ?? 0;
      const bPrice = prices[b.id]?.price ?? 0;
      return bPrice - aPrice;
    });
  }, [activeTab, searchQuery, favorites, language, prices]);

  if (loading && Object.keys(prices).length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border/60 px-4 py-3 flex items-center gap-3 animate-pulse"
          >
            <div className="h-11 w-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2 text-end">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-12 bg-muted rounded ms-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    if (activeTab === "favorites") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Star className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            {t(language, "favoritesEmpty")}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t(language, "addHint")}
          </p>
        </div>
      );
    }
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        {t(language, "noData")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAssets.map((asset) => (
        <PriceCard
          key={asset.id}
          asset={asset}
          price={prices[asset.id]}
          onClick={() => onSelectAsset(asset.id)}
        />
      ))}
    </div>
  );
}
