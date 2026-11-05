"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function SearchBar() {
  const language = useAppStore((s) => s.language);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t(language, "search")}
        className="h-10 ps-9 pe-9 rounded-full bg-muted/60 border-transparent focus-visible:bg-background focus-visible:border-input"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
          aria-label="clear"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
