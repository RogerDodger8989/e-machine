"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  href: string;
  label: string;
  description?: string;
}

/**
 * Underflik-rad för en grupp relaterade sidor (t.ex. Maskiner/Modeller,
 * eller Utskick-sektionens Logg/Kampanj/Service/Statistik). Aktiv flik
 * avgörs av längsta matchande href (så t.ex. /machines/new inte råkar
 * matcha en kortare, oralaterad href).
 */
export function SubNav({ items }: { items: SubNavItem[] }) {
  const pathname = usePathname();
  const active = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-1 border-b overflow-x-auto">
        {items.map((item) => {
          const isActive = active?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {active?.description && <p className="text-sm text-muted-foreground">{active.description}</p>}
    </div>
  );
}
