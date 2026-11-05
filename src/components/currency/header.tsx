"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Languages, RefreshCw, PictureInPicture2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SettingsPopover } from "./settings-popover";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

interface HeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: number;
  onToggleFloating: () => void;
  floatingActive: boolean;
}

export function Header({
  onRefresh,
  refreshing,
  onToggleFloating,
  floatingActive,
}: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);
  // Wait for mount before rendering the theme icon so SSR and the first
  // client render match (prevents the React hydration error)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 ios-blur bg-background/70 border-b border-border/40">
      <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {t(language, "appName")}
          </h1>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {t(language, "appTagline")}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFloating}
            className="rounded-full h-9 w-9"
            aria-label={t(language, "floatingMode")}
            title={t(language, "floatingMode")}
            style={floatingActive ? { background: "var(--primary)", color: "var(--primary-foreground)" } : undefined}
          >
            <PictureInPicture2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full h-9 w-9"
            aria-label={t(language, "refresh")}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full h-9 w-9 relative"
            aria-label={t(language, "language")}
          >
            <Languages className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full h-3.5 w-3.5 flex items-center justify-center">
              {language === "fa" ? "فا" : "EN"}
            </span>
          </Button>

          <SettingsPopover />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full h-9 w-9"
            aria-label={t(language, "theme")}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
