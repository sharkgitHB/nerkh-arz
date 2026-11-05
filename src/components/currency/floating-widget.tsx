"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, GripVertical, Pin, PinOff } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ASSETS, getAsset, getAssetName } from "@/lib/assets";
import { t } from "@/lib/i18n";
import { formatLocalizedPrice, formatPercent } from "@/lib/format";
import { AssetIcon } from "./asset-icon";
import type { PriceData } from "@/app/api/rates/route";

interface FloatingWidgetProps {
  prices: Record<string, PriceData>;
  open: boolean;
  onClose: () => void;
  // The PiP window opened by the parent click handler (if any)
  pipWindow: DocumentPiPWindow | null;
}

// TypeScript types for Document Picture-in-Picture API
export interface DocumentPiPWindow {
  window: Window;
}
export interface DocumentPictureInPicture {
  requestWindow: (options?: {
    width?: number;
    height?: number;
  }) => Promise<DocumentPiPWindow>;
  window: Window | null;
}
declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export function isPipSupported(): boolean {
  // Document PiP requires:
  // 1. Browser support (Chrome 116+, Edge, Android Chrome - NOT iOS Safari, NOT Firefox)
  // 2. Not running in headless mode (headless Chromium opens PiP but it's immediately closed)
  // 3. User activation (caller must be triggered by user click)
  if (typeof window === "undefined") return false;
  if (!window.documentPictureInPicture) return false;
  // Detect headless mode where PiP opens but immediately closes
  if (/HeadlessChrome/.test(navigator.userAgent)) return false;
  return true;
}

// Call from a click handler to open a PiP window
export async function openPipWindow(
  language: string,
  onClose: () => void,
): Promise<DocumentPiPWindow | null> {
  if (!isPipSupported()) return null;
  try {
    const newPipWindow =
      await window.documentPictureInPicture!.requestWindow({
        width: 280,
        height: 380,
      });

    // Verify the window is actually usable (in headless browsers it may open but be closed)
    if (!newPipWindow || newPipWindow.window.closed) {
      return null;
    }

    // Copy stylesheets to PiP window
    const docStyles = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    docStyles.forEach((node) => {
      const clone = node.cloneNode(true);
      newPipWindow.window.document.head.appendChild(clone);
    });

    const style = newPipWindow.window.document.createElement("style");
    style.textContent = `
      html, body {
        margin: 0; padding: 0;
        background: var(--background, #f2f2f7);
        color: var(--foreground, #1c1c1e);
        font-family: var(--font-vazir), var(--font-sans), -apple-system, sans-serif;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
      }
      body * { box-sizing: border-box; }
    `;
    newPipWindow.window.document.head.appendChild(style);

    const isDark = document.documentElement.classList.contains("dark");
    newPipWindow.window.document.documentElement.classList.toggle("dark", isDark);
    newPipWindow.window.document.documentElement.setAttribute(
      "dir",
      language === "fa" ? "rtl" : "ltr",
    );
    newPipWindow.window.document.documentElement.setAttribute("lang", language);

    newPipWindow.window.addEventListener("pagehide", () => {
      onClose();
    });

    return newPipWindow;
  } catch (e) {
    console.error("PiP failed, falling back to in-page widget:", e);
    return null;
  }
}

export function FloatingWidget({
  prices,
  open,
  onClose,
  pipWindow,
}: FloatingWidgetProps) {
  const language = useAppStore((s) => s.language);
  const favorites = useAppStore((s) => s.favorites);

  // In-page floating widget state
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [pinned, setPinned] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  // Items to display: prefer favorites; cap to 5
  const widgetAssets = (() => {
    const favs = favorites
      .map((id) => getAsset(id))
      .filter((a): a is NonNullable<typeof a> => !!a);
    const list = favs.length
      ? favs
      : ASSETS.filter((a) =>
          ["usd", "gold_ounce", "emami_coin", "eur", "aed"].includes(a.id),
        );
    return list.slice(0, 5);
  })();

  // Dragging handlers
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pinned) return;
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pinned, position.x, position.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 280, dragStartRef.current.posX + dx),
    );
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 200, dragStartRef.current.posY + dy),
    );
    setPosition({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const renderWidgetContent = () => {
    return (
      <div className="bg-background text-foreground rounded-2xl overflow-hidden shadow-2xl border border-border/50">
        {/* Header */}
        <div className="ios-blur bg-background/80 px-3 py-2 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs"
              style={{
                background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                color: "white",
              }}
            >
              $
            </div>
            <span className="text-xs font-semibold truncate">
              {t(language, "appName")}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {new Date().toLocaleTimeString(
              language === "fa" ? "fa-IR" : "en-US",
              { hour: "2-digit", minute: "2-digit" },
            )}
          </span>
        </div>

        {/* Items */}
        <div className="p-2 space-y-1">
          {widgetAssets.map((asset) => {
            const p = prices[asset.id];
            const change = p?.change24h ?? 0;
            const isUp = change >= 0;
            return (
              <div
                key={asset.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors"
              >
                <AssetIcon icon={asset.icon} color={asset.color} size={28} fallback={asset.symbol.charAt(0)} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">
                    {getAssetName(asset, language)}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {asset.symbol}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-[11px] font-semibold tabular-nums leading-tight">
                    {p
                      ? formatLocalizedPrice(p.price, p.priceIrr, language)
                      : "—"}
                  </div>
                  {p && (
                    <div
                      className={`text-[9px] tabular-nums leading-tight ${
                        isUp ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {formatPercent(change, language)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-border/40 bg-muted/30">
          <p className="text-[9px] text-muted-foreground text-center">
            {language === "fa"
              ? "آپدیت خودکار هر ۶۰ ثانیه"
              : "Auto-updates every 60s"}
          </p>
        </div>
      </div>
    );
  };

  if (!open) return null;

  // Render into PiP window if available
  if (pipWindow) {
    return createPortal(
      renderWidgetContent(),
      pipWindow.window.document.body,
    );
  }

  // In-page fallback floating widget
  return (
    <div
      className="fixed z-[9999] select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "260px",
      }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute -top-1 start-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing px-2 py-0.5"
        style={{ touchAction: "none" }}
        aria-label="drag"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
      </div>

      <div className="relative">
        {renderWidgetContent()}

        {/* Controls */}
        <div className="absolute -top-2 -end-2 flex gap-1">
          <button
            onClick={() => setPinned(!pinned)}
            className="h-6 w-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent"
            aria-label={pinned ? "Unpin" : "Pin"}
            title={pinned ? "Unlock drag" : "Lock position"}
          >
            {pinned ? (
              <Pin className="h-3 w-3 text-muted-foreground" />
            ) : (
              <PinOff className="h-3 w-3 text-amber-500" />
            )}
          </button>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent"
            aria-label="close"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
