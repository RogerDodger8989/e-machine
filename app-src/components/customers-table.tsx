"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortHeaderButton } from "@/components/sort-header";
import { MailtoLink } from "@/components/mailto-link";

export interface CustomerRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  marketingConsent: boolean;
  machineCount: number;
  latestRegistration: string | null; // ISO
  latestOutreach: string | null; // ISO
}

type SortKey =
  | "name"
  | "company"
  | "phone"
  | "email"
  | "machineCount"
  | "marketingConsent"
  | "latestRegistration"
  | "latestOutreach";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("sv-SE");
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...customers].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "sv-SE") * dir;
        case "company":
          return (a.company ?? "").localeCompare(b.company ?? "", "sv-SE") * dir;
        case "phone":
          return (a.phone ?? "").localeCompare(b.phone ?? "", "sv-SE") * dir;
        case "email":
          return (a.email ?? "").localeCompare(b.email ?? "", "sv-SE") * dir;
        case "machineCount":
          return (a.machineCount - b.machineCount) * dir;
        case "marketingConsent":
          return (Number(a.marketingConsent) - Number(b.marketingConsent)) * dir;
        case "latestRegistration": {
          const av = a.latestRegistration ? new Date(a.latestRegistration).getTime() : -Infinity;
          const bv = b.latestRegistration ? new Date(b.latestRegistration).getTime() : -Infinity;
          return (av - bv) * dir;
        }
        case "latestOutreach": {
          const av = a.latestOutreach ? new Date(a.latestOutreach).getTime() : -Infinity;
          const bv = b.latestOutreach ? new Date(b.latestOutreach).getTime() : -Infinity;
          return (av - bv) * dir;
        }
        default:
          return 0;
      }
    });
  }, [customers, sortKey, sortDir]);

  const headers: { label: string; key: SortKey }[] = [
    { label: "Kontaktperson", key: "name" },
    { label: "Företag", key: "company" },
    { label: "Telefon", key: "phone" },
    { label: "E-post", key: "email" },
    { label: "Maskiner", key: "machineCount" },
    { label: "Samtycke", key: "marketingConsent" },
    { label: "Senaste registrering", key: "latestRegistration" },
    { label: "Senaste utskick", key: "latestOutreach" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h) => (
            <TableHead key={h.key}>
              <SortHeaderButton
                label={h.label}
                sortKeyName={h.key}
                activeKey={sortKey}
                direction={sortDir}
                onToggle={toggleSort}
              />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <Link href={`/customers/${c.id}`} className="hover:underline font-medium">
                {c.name}
              </Link>
            </TableCell>
            <TableCell>{c.company ?? "—"}</TableCell>
            <TableCell>{c.phone ?? "—"}</TableCell>
            <TableCell>{c.email ? <MailtoLink email={c.email} /> : "—"}</TableCell>
            <TableCell>{c.machineCount}</TableCell>
            <TableCell>
              {c.marketingConsent ? <Badge>Ja</Badge> : <Badge variant="secondary">Nej</Badge>}
            </TableCell>
            <TableCell>{formatDate(c.latestRegistration)}</TableCell>
            <TableCell>{formatDate(c.latestOutreach)}</TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              Inga kunder ännu.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
