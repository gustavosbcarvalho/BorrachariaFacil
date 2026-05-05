"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const PRESETS = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "week" },
  { label: "Mês", value: "month" },
  { label: "Todos", value: "all" },
] as const;

type Preset = (typeof PRESETS)[number]["value"];

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("period") as Preset) ?? "all";

  const setPreset = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value === "all") {
        next.delete("period");
        next.delete("from");
        next.delete("to");
      } else {
        next.set("period", value);
        next.delete("from");
        next.delete("to");
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const setCustomRange = useCallback(
    (from: string, to: string) => {
      const next = new URLSearchParams(params.toString());
      next.delete("period");
      if (from) next.set("from", from); else next.delete("from");
      if (to) next.set("to", to); else next.delete("to");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const fromVal = params.get("from") ?? "";
  const toVal = params.get("to") ?? "";
  const isCustom = !params.get("period") && (fromVal || toVal);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              current === p.value && !isCustom
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 active:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={fromVal}
          onChange={(e) => setCustomRange(e.target.value, toVal)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <span className="text-gray-400 text-xs">até</span>
        <input
          type="date"
          value={toVal}
          onChange={(e) => setCustomRange(fromVal, e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
