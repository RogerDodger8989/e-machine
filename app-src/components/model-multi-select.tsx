"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Model {
  id: string;
  manufacturer: string;
  modelName: string;
}

export function ModelMultiSelect({
  models,
  selectedModelIds,
}: {
  models: Model[];
  selectedModelIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => `${m.manufacturer} ${m.modelName}`.toLowerCase().includes(q));
  }, [models, query]);

  function updateUrl(nextIds: string[]) {
    router.push(nextIds.length === 0 ? "/machines" : `/machines?modelId=${nextIds.join(",")}`);
  }

  function toggle(id: string) {
    const next = selectedModelIds.includes(id)
      ? selectedModelIds.filter((x) => x !== id)
      : [...selectedModelIds, id];
    updateUrl(next);
  }

  const label =
    selectedModelIds.length === 0
      ? "Alla modeller"
      : selectedModelIds.length === 1
        ? (() => {
            const m = models.find((m) => m.id === selectedModelIds[0]);
            return m ? `${m.manufacturer} ${m.modelName}` : "1 modell vald";
          })()
        : `${selectedModelIds.length} modeller valda`;

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-64 justify-between font-normal"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="size-4 opacity-50 shrink-0" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <Input
              autoFocus
              placeholder="Sök modell…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {selectedModelIds.length > 0 && (
              <button
                type="button"
                onClick={() => updateUrl([])}
                className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-sm"
              >
                Rensa filter
              </button>
            )}
            {filtered.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-sm cursor-pointer"
              >
                <Checkbox checked={selectedModelIds.includes(m.id)} onCheckedChange={() => toggle(m.id)} />
                <span className="truncate">
                  {m.manufacturer} {m.modelName}
                </span>
              </label>
            ))}
            {filtered.length === 0 && <p className="px-2 py-2 text-sm text-muted-foreground">Inga träffar</p>}
          </div>
        </div>
      )}
    </div>
  );
}
