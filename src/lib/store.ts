"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "./i18n";

// Floating widget presentation: in-page overlay (PiP) or a real window
export type WidgetMode = "pip" | "window";

interface AppState {
  language: Language;
  favorites: string[]; // asset ids
  activeTab:
    | "all"
    | "favorites"
    | "currencies"
    | "metals"
    | "crypto"
    | "convert";
  searchQuery: string;
  widgetMode: WidgetMode;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  toggleFavorite: (id: string) => void;
  setActiveTab: (tab: AppState["activeTab"]) => void;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "fa",
      favorites: ["usd", "eur", "aed", "gold_ounce", "emami_coin", "btc", "eth", "usdt"],
      activeTab: "all",
      searchQuery: "",
      // Desktop app defaults to the real window; browsers use the in-page mode
      widgetMode:
        typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent)
          ? "window"
          : "pip",

      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set((s) => ({ language: s.language === "fa" ? "en" : "fa" })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: "currency-app-storage",
      partialize: (s) => ({
        language: s.language,
        favorites: s.favorites,
      }),
    },
  ),
);
