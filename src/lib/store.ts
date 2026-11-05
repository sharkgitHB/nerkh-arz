"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "./i18n";

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
