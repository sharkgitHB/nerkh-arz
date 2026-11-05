"use client";

import { AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { timeAgo } from "@/lib/format";

interface StatusBarProps {
  lastRefresh: number;
  loading: boolean;
  errorCount: number;
  error: string | null;
}

export function StatusBar({
  lastRefresh,
  loading,
  errorCount,
  error,
}: StatusBarProps) {
  const language = useAppStore((s) => s.language);

  if (error && !lastRefresh) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 py-2">
        <AlertCircle className="h-3.5 w-3.5" />
        {t(language, "error")}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-2">
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          {t(language, "refreshing")}
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span>{t(language, "lastRefresh")}:</span>
          {lastRefresh ? (
            <span className="tabular-nums">{timeAgo(lastRefresh, language)}</span>
          ) : (
            <span>—</span>
          )}
          {errorCount > 0 && (
            <span className="text-amber-500 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {language === "fa"
                ? `${errorCount} منبع ناموفق`
                : `${errorCount} source(s) failed`}
            </span>
          )}
        </>
      )}
    </div>
  );
}
