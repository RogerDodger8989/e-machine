"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BalanceEntry {
  ok: boolean;
  label?: string;
  error?: string;
}

interface BalanceResponse {
  elks: BalanceEntry | null;
}

function ProviderBadge({ name, entry, title }: { name: string; entry: BalanceEntry; title?: string }) {
  return (
    <Badge
      variant={entry.ok ? "outline" : "destructive"}
      title={entry.ok ? title : entry.error}
      className="font-normal"
    >
      <span className="text-muted-foreground">{name}</span> {entry.ok ? entry.label : "fel"}
    </Badge>
  );
}

export function MessagingBalance() {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/messaging/balance")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!data || !data.elks) return null;

  return (
    <div className="hidden md:flex items-center gap-1.5">
      {data.elks && <ProviderBadge name="Saldo:" entry={data.elks} title="Saldo hos 46elks" />}
      <button
        type="button"
        onClick={load}
        disabled={loading}
        title="Uppdatera saldo"
        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
      </button>
    </div>
  );
}
