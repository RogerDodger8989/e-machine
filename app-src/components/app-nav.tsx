"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { MessagingBalance } from "@/components/messaging-balance";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/customers", label: "Kunder" },
  { href: "/machines", label: "Maskiner" },
  { href: "/machine-models", label: "Modeller" },
  { href: "/sms", label: "Sms" },
  { href: "/statistik", label: "Statistik" },
  { href: "/messages", label: "Utskick" },
  { href: "/settings", label: "Inställningar" },
];

export function AppNav({
  backupWarning = false,
  failedMessageCount = 0,
}: {
  backupWarning?: boolean;
  failedMessageCount?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-3">
        <Link href="/" className="font-semibold text-lg shrink-0">
          e-Machines
        </Link>
        <nav className="flex flex-nowrap gap-0.5 text-sm shrink-0 overflow-x-auto sm:overflow-visible -mx-1 px-1 sm:mx-0 sm:px-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2 py-1.5 rounded-md whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sm:ml-auto flex flex-nowrap items-center gap-1.5 w-full sm:w-auto">
          {failedMessageCount > 0 && (
            <Link href="/messages?status=failed" className="shrink-0">
              <Badge variant="destructive" className="whitespace-nowrap">
                {failedMessageCount} misslyckade utskick
              </Badge>
            </Link>
          )}
          <MessagingBalance />
          <ThemeToggle />
          <div className="w-full sm:w-32 md:w-40 lg:w-48">
            <SearchBar />
          </div>
        </div>
      </div>
      {backupWarning && !pathname.startsWith("/settings/backup") && (
        <Link
          href="/settings/backup"
          className="flex items-center gap-2 border-t bg-destructive/10 px-4 sm:px-6 py-1.5 text-xs text-destructive hover:bg-destructive/15"
        >
          <TriangleAlert className="size-3.5 shrink-0" />
          Något är fel med backuperna — klicka för att se detaljer.
        </Link>
      )}
    </header>
  );
}
