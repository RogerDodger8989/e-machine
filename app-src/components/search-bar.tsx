"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { SearchResult } from "@/lib/search";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  customer: "Kund",
  machine: "Maskin",
  model: "Modell",
};

const TYPE_HREF: Record<SearchResult["type"], (id: string) => string> = {
  customer: (id) => `/customers/${id}`,
  machine: (id) => `/machines/${id}`,
  model: (id) => `/machine-models/${id}`,
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(TYPE_HREF[result.type](result.id));
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Sök kund, telefon, modell eller serienummer…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-80 overflow-auto">
          {loading && <div className="px-3 py-2 text-sm text-muted-foreground">Söker…</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Inga träffar</div>
          )}
          {!loading &&
            results.map((r) =>
              r.type === "customer" ? (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => goTo(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{r.company || r.label}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{TYPE_LABEL[r.type]}</span>
                  </div>
                  {r.company && (
                    <div className="truncate text-xs text-muted-foreground">
                      {[r.label, r.sublabel, r.email].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {!r.company && (r.sublabel || r.email) && (
                    <div className="truncate text-xs text-muted-foreground">
                      {[r.sublabel, r.email].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => goTo(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                >
                  <span className="truncate">{r.label}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {TYPE_LABEL[r.type]}
                    {r.sublabel ? ` · ${r.sublabel}` : ""}
                  </span>
                </button>
              )
            )}
        </div>
      )}
    </div>
  );
}
