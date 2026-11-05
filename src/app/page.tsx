"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Header } from "@/components/currency/header";
import { SearchBar } from "@/components/currency/search-bar";
import { CategoryTabs } from "@/components/currency/tabs";
import { PriceList } from "@/components/currency/price-list";
import { Converter } from "@/components/currency/converter";
import { DetailSheet } from "@/components/currency/detail-sheet";
import { UpdateBanner } from "@/components/currency/update-banner";
import { WidgetWindow, WidgetPanel } from "@/components/currency/widget-window";
import {
  openPipWindow,
  type DocumentPiPWindow,
} from "@/components/currency/floating-widget";
import { StatusBar } from "@/components/currency/status-bar";
import { usePrices } from "@/components/currency/use-prices";
import { useAppStore } from "@/lib/store";
import { getAsset } from "@/lib/assets";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Desktop widget window state (always-on-top Electron window)
  const [floatingOpen, setFloatingOpen] = useState(false);
  // Browser Document PiP window state
  const [pipWindow, setPipWindow] = useState<DocumentPiPWindow | null>(null);
  const { data, loading, error, errors, lastRefresh, refresh } = usePrices(60000);
  const [refreshing, setRefreshing] = useState(false);
  const language = useAppStore((s) => s.language);
  const activeTab = useAppStore((s) => s.activeTab);
  // Dedicated floating-widget window (Electron only, ?widget=1)
  const [isWidgetWindow, setIsWidgetWindow] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("widget=1")) setIsWidgetWindow(true);
  }, []);

  // Keep the header button in sync when the widget window is closed directly
  useEffect(() => {
    const bridge = window.desktopApp;
    if (!bridge?.onWidgetClosed) return;
    return bridge.onWidgetClosed(() => setFloatingOpen(false));
  }, []);

  const selectedAsset = useMemo(
    () => (selectedId ? (getAsset(selectedId) ?? null) : null),
    [selectedId],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleToggleFloating = useCallback(async () => {
    // Desktop app: always open the real always-on-top widget window
    if (window.desktopApp?.toggleWidget) {
      try {
        const open = await window.desktopApp.toggleWidget();
        setFloatingOpen(open);
      } catch (e) {
        console.error("widget toggle error:", e);
      }
      return;
    }

    // Browser: Document PiP window with the same widget panel
    if (pipWindow) {
      try {
        pipWindow.window.close();
      } catch {
        /* ignore */
      }
      setPipWindow(null);
      return;
    }

    try {
      const opened = await openPipWindow(language, () => {
        setPipWindow(null);
      });
      if (opened && !opened.window.closed) {
        setPipWindow(opened);
      }
    } catch (e) {
      console.error("PiP open error:", e);
    }
  }, [pipWindow, language]);

  // Floating widget window renders standalone (no header/list/banner)
  if (isWidgetWindow) {
    return <WidgetWindow />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastRefresh={lastRefresh}
        onToggleFloating={handleToggleFloating}
        floatingActive={floatingOpen || pipWindow !== null}
      />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-3 pb-8">
        <div className="space-y-3">
          <CategoryTabs />
          {activeTab === "convert" ? (
            <Converter prices={data} loading={loading} />
          ) : (
            <>
              <SearchBar />
              <StatusBar
                lastRefresh={lastRefresh}
                loading={loading}
                errorCount={errors.length}
                error={error}
              />
              <PriceList
                prices={data}
                loading={loading}
                onSelectAsset={setSelectedId}
              />
            </>
          )}
        </div>
      </main>

      <DetailSheet
        asset={selectedAsset}
        price={selectedId ? data[selectedId] : undefined}
        open={selectedId !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
      />

      {/* Browser floating mode: the widget panel inside a Document PiP window */}
      {pipWindow &&
        createPortal(
          <WidgetPanel
            prices={data}
            loading={loading}
            lastRefresh={lastRefresh}
            onRefresh={handleRefresh}
          />,
          pipWindow.window.document.body,
        )}

      {/* Auto-update banner (Electron desktop only) */}
      <UpdateBanner />
    </div>
  );
}
