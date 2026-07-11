"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export interface CustomerOption {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
}

function customerLabel(c: CustomerOption): string {
  return c.company ? `${c.company} - ${c.name}` : c.name;
}

export function CustomerPicker({
  customers,
  initialCustomerId,
  name = "customerId",
  onSelectionChange,
}: {
  customers: CustomerOption[];
  initialCustomerId?: string;
  name?: string;
  onSelectionChange?: (id: string | null) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialCustomerId ?? null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSelectionChange?.(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.company ?? ""} ${c.name} ${c.phone ?? ""}`.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  function select(id: string) {
    setSelectedId(id);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setSelectedId(null);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId ?? ""} />
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-normal"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">
          {selected
            ? `${customerLabel(selected)}${selected.phone ? ` · ${selected.phone}` : ""}`
            : "Sök och välj kund…"}
        </span>
        <ChevronDown className="size-4 opacity-50 shrink-0" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <Input
              autoFocus
              placeholder="Sök kund (namn, företag, telefon)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {selectedId && (
              <button
                type="button"
                onClick={clear}
                className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-sm"
              >
                Rensa val
              </button>
            )}
            {filtered.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => select(c.id)}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
              >
                <div className="truncate">{customerLabel(c)}</div>
                {c.phone && <div className="text-xs text-muted-foreground">{c.phone}</div>}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-sm text-muted-foreground">Inga träffar</p>
            )}
          </div>
          <div className="border-t p-2">
            <Link href="/customers/new" className="text-xs text-muted-foreground hover:underline">
              Kunden finns inte än? Skapa ny kund
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
