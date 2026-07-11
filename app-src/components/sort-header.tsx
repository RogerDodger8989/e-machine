"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SortHeaderButton<K extends string>({
  label,
  sortKeyName,
  activeKey,
  direction,
  onToggle,
}: {
  label: string;
  sortKeyName: K;
  activeKey: K;
  direction: "asc" | "desc";
  onToggle: (key: K) => void;
}) {
  const isActive = activeKey === sortKeyName;
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKeyName)}
      className={cn(
        "flex items-center gap-1 hover:text-foreground",
        isActive ? "text-foreground font-medium" : "text-muted-foreground"
      )}
    >
      {label}
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </button>
  );
}
