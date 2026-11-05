"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";

type UpdateMessage =
  | { type: "available"; version: string }
  | { type: "progress"; percent: number }
  | { type: "downloaded"; version: string };

interface DesktopAppBridge {
  onUpdateMessage: (cb: (msg: UpdateMessage) => void) => () => void;
  installUpdate: () => Promise<void>;
}

/**
 * Auto-update banner for the Electron desktop app.
 * Listens to update events exposed by the preload bridge and shows a
 * small bottom card (download progress → install button).
 */
export function UpdateBanner() {
  const language = useAppStore((s) => s.language);
  const [msg, setMsg] = useState<UpdateMessage | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const bridge = (window as unknown as { desktopApp?: DesktopAppBridge })
      .desktopApp;
    if (!bridge?.onUpdateMessage) return;
    return bridge.onUpdateMessage((m) => setMsg(m));
  }, []);

  if (!msg) return null;
  const bridge = (window as unknown as { desktopApp?: DesktopAppBridge })
    .desktopApp;

  const fa = language === "fa";

  let text = "";
  let action: "none" | "install" = "none";
  if (msg.type === "available") {
    text = fa
      ? `نسخه ${msg.version} پیدا شد — در حال دانلود…`
      : `Version ${msg.version} found — downloading…`;
  } else if (msg.type === "progress") {
    text = fa
      ? `در حال دانلود بروزرسانی… ${msg.percent}٪`
      : `Downloading update… ${msg.percent}%`;
  } else {
    text = fa
      ? `بروزرسانی ${msg.version} دانلود شد`
      : `Update ${msg.version} downloaded`;
    action = "install";
  }

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-card border border-border/60 shadow-lg px-4 py-2.5 max-w-sm">
        {action === "install" ? (
          <Download className="h-4 w-4 text-primary flex-shrink-0" />
        ) : (
          <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
        )}
        <span className="text-xs font-medium flex-1">{text}</span>
        {action === "install" && (
          <button
            onClick={() => {
              setInstalling(true);
              bridge?.installUpdate();
            }}
            disabled={installing}
            className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3.5 h-8 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            {installing
              ? fa
                ? "در حال نصب…"
                : "Installing…"
              : fa
                ? "نصب و راه‌اندازی مجدد"
                : "Install & restart"}
          </button>
        )}
      </div>
    </div>
  );
}
