"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { PriceData } from "@/app/api/rates/route";

interface RatesResponse {
  prices: Record<string, PriceData>;
  timestamp: number;
  errors: string[];
}

async function fetchRates(): Promise<RatesResponse> {
  const res = await fetch("/api/rates");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function usePrices(refreshIntervalMs = 60000) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["rates"],
    queryFn: fetchRates,
    refetchInterval: refreshIntervalMs,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["rates"] });
  }, [queryClient]);

  return {
    data: data?.prices ?? {},
    timestamp: data?.timestamp ?? 0,
    errors: data?.errors ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    lastRefresh: dataUpdatedAt,
    refresh,
  };
}
