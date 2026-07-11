"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function preset(months: number | "ytd" | "lastYear"): { from: string; to: string } {
  const now = new Date();
  if (months === "ytd") {
    return { from: toISODate(new Date(now.getFullYear(), 0, 1)), to: toISODate(now) };
  }
  if (months === "lastYear") {
    return {
      from: toISODate(new Date(now.getFullYear() - 1, 0, 1)),
      to: toISODate(new Date(now.getFullYear() - 1, 11, 31)),
    };
  }
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return { from: toISODate(from), to: toISODate(now) };
}

const PRESETS: { key: string; label: string; range: { from: string; to: string } }[] = [
  { key: "12m", label: "Senaste 12 månaderna", range: preset(12) },
  { key: "24m", label: "Senaste 24 månaderna", range: preset(24) },
  { key: "ytd", label: "Innevarande år", range: preset("ytd") },
  { key: "lastYear", label: "Föregående år", range: preset("lastYear") },
];

export function StatistikFilters({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  const activePreset = PRESETS.find((p) => p.range.from === from && p.range.to === to)?.key;

  function apply(nextFrom: string, nextTo: string) {
    router.push(`/statistik?from=${nextFrom}&to=${nextTo}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            type="button"
            size="sm"
            variant={activePreset === p.key ? "default" : "outline"}
            onClick={() => {
              setFromValue(p.range.from);
              setToValue(p.range.to);
              apply(p.range.from, p.range.to);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2 sm:border-l sm:pl-3 sm:ml-1">
        <div className="space-y-1">
          <Label htmlFor="from-date" className="text-xs text-muted-foreground">
            Från
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to-date" className="text-xs text-muted-foreground">
            Till
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
            className="w-40"
          />
        </div>
        <Button type="button" size="sm" onClick={() => apply(fromValue, toValue)}>
          Visa
        </Button>
      </div>
    </div>
  );
}
