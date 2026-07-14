"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortHeaderButton } from "@/components/sort-header";
import { CopyButton } from "@/components/copy-button";
import { Pencil } from "lucide-react";

export interface MachineRow {
  id: string;
  serialNumber: string;
  manufacturer: string;
  modelName: string;
  category: string | null;
  modelId: string;
  ownerCustomerId: string | null;
  company: string | null;
  contactPerson: string | null;
  warrantyEndDate: string | null; // ISO
  createdAt: string; // ISO
}

type SortKey =
  | "serialNumber"
  | "category"
  | "modelName"
  | "company"
  | "contactPerson"
  | "warrantyEndDate"
  | "createdAt";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("sv-SE");
}

export function MachinesTable({ machines }: { machines: MachineRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
    return [...machines].sort((a, b) => {
      switch (sortKey) {
        case "serialNumber":
          return a.serialNumber.localeCompare(b.serialNumber, "sv-SE") * dir;
        case "category":
          return (a.category ?? "").localeCompare(b.category ?? "", "sv-SE") * dir;
        case "modelName":
          return `${a.manufacturer} ${a.modelName}`.localeCompare(`${b.manufacturer} ${b.modelName}`, "sv-SE") * dir;
        case "company":
          return (a.company ?? "").localeCompare(b.company ?? "", "sv-SE") * dir;
        case "contactPerson":
          return (a.contactPerson ?? "").localeCompare(b.contactPerson ?? "", "sv-SE") * dir;
        case "warrantyEndDate": {
          const av = a.warrantyEndDate ? new Date(a.warrantyEndDate).getTime() : -Infinity;
          const bv = b.warrantyEndDate ? new Date(b.warrantyEndDate).getTime() : -Infinity;
          return (av - bv) * dir;
        }
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        default:
          return 0;
      }
    });
  }, [machines, sortKey, sortDir]);

  const headers: { label: string; key: SortKey }[] = [
    { label: "Serienummer", key: "serialNumber" },
    { label: "Kategori", key: "category" },
    { label: "Modell", key: "modelName" },
    { label: "Företag", key: "company" },
    { label: "Kontaktperson", key: "contactPerson" },
    { label: "Garanti t.o.m.", key: "warrantyEndDate" },
    { label: "Registrerad", key: "createdAt" },
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
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <span className="inline-flex items-center gap-1">
                <Link href={`/machines/${m.id}`} className="hover:underline font-medium">
                  {m.serialNumber}
                </Link>
                <CopyButton value={m.serialNumber} copiedMessage="Serienummer kopierat" ariaLabel="Kopiera serienummer" />
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{m.category ?? "—"}</TableCell>
            <TableCell>
              <Link href={`/machine-models/${m.modelId}`} className="hover:underline">
                <Badge variant="secondary" className="mr-1">
                  {m.manufacturer}
                </Badge>
                {m.modelName}
              </Link>
            </TableCell>
            <TableCell>
              {m.company && m.ownerCustomerId ? (
                <Link href={`/customers/${m.ownerCustomerId}`} className="hover:underline">
                  {m.company}
                </Link>
              ) : (
                (m.company ?? "—")
              )}
            </TableCell>
            <TableCell>
              {m.contactPerson && m.ownerCustomerId ? (
                <Link href={`/customers/${m.ownerCustomerId}`} className="hover:underline">
                  {m.contactPerson}
                </Link>
              ) : (
                (m.contactPerson ?? "—")
              )}
            </TableCell>
            <TableCell>{formatDate(m.warrantyEndDate)}</TableCell>
            <TableCell>{formatDate(m.createdAt)}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                render={
                  <Link href={`/machines/${m.id}/edit`} title="Redigera maskin" aria-label="Redigera maskin">
                    <Pencil />
                  </Link>
                }
              />
            </TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              Inga maskiner ännu.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
