"use client";

import { Star, Coins, Gem, Bitcoin, ArrowLeftRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

const tabs = [
  { id: "all", icon: null, key: "all" as const },
  { id: "favorites", icon: Star, key: "favorites" as const },
  { id: "currencies", icon: Coins, key: "currencies" as const },
  { id: "metals", icon: Gem, key: "metals" as const },
  { id: "crypto", icon: Bitcoin, key: "crypto" as const },
  { id: "convert", icon: ArrowLeftRight, key: "convert" as const },
];

export function CategoryTabs() {
  const language = useAppStore((s) => s.language);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <div className="no-scrollbar overflow-x-auto -mx-4 px-4">
      <div className="flex gap-2 min-w-max pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.key)}
              className="relative inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-medium transition-colors"
              style={{
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                background: isActive ? "var(--primary)" : "var(--muted)",
              }}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{t(language, tab.key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
