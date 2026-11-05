"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore, type WidgetMode } from "@/lib/store";
import { t } from "@/lib/i18n";

function ModeOption({
  value,
  title,
  desc,
}: {
  value: WidgetMode;
  title: string;
  desc: string;
}) {
  const widgetMode = useAppStore((s) => s.widgetMode);
  const setWidgetMode = useAppStore((s) => s.setWidgetMode);
  const isDesktop = Boolean(
    typeof window !== "undefined" && window.desktopApp?.isDesktop,
  );
  const active = widgetMode === value;
  const disabled = value === "window" && !isDesktop;

  return (
    <button
      onClick={() => !disabled && setWidgetMode(value)}
      disabled={disabled}
      className={`w-full text-start rounded-xl border p-3 transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border/60 hover:bg-accent/60"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span
          className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
            active ? "border-primary bg-primary" : "border-muted-foreground/40"
          }`}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
        {desc}
        {disabled ? " — در مرورگر موجود نیست" : ""}
      </p>
    </button>
  );
}

export function SettingsPopover() {
  const language = useAppStore((s) => s.language);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          aria-label={t(language, "settingsTitle")}
          title={t(language, "settingsTitle")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <h3 className="text-sm font-bold mb-0.5">
          {t(language, "settingsTitle")}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-2.5">
          {t(language, "widgetModeDesc")}
        </p>
        <div className="space-y-2">
          <ModeOption
            value="pip"
            title={t(language, "widgetModePip")}
            desc={t(language, "widgetModePipDesc")}
          />
          <ModeOption
            value="window"
            title={t(language, "widgetModeWindow")}
            desc={t(language, "widgetModeWindowDesc")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
