"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortHeaderButton } from "@/components/sort-header";

export interface MachineModelRow {
  id: string;
  manufacturer: string;
  modelName: string;
  category: string | null;
  standardWarrantyMonths: number;
  standardServiceIntervalMonths: number;
  machineCount: number;
}

type SortKey =
  | "manufacturer"
  | "modelName"
  | "category"
  | "standardWarrantyMonths"
  | "standardServiceIntervalMonths"
  | "machineCount";

export function MachineModelsTable({ models }: { models: MachineModelRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("manufacturer");
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
    return [...models].sort((a, b) => {
      switch (sortKey) {
        case "manufacturer":
          return a.manufacturer.localeCompare(b.manufacturer, "sv-SE") * dir;
        case "modelName":
          return a.modelName.localeCompare(b.modelName, "sv-SE") * dir;
        case "category":
          return (a.category ?? "").localeCompare(b.category ?? "", "sv-SE") * dir;
        case "standardWarrantyMonths":
          return (a.standardWarrantyMonths - b.standardWarrantyMonths) * dir;
        case "standardServiceIntervalMonths":
          return (a.standardServiceIntervalMonths - b.standardServiceIntervalMonths) * dir;
        case "machineCount":
          return (a.machineCount - b.machineCount) * dir;
        default:
          return 0;
      }
    });
  }, [models, sortKey, sortDir]);

  const headers: { label: string; key: SortKey }[] = [
    { label: "Tillverkare", key: "manufacturer" },
    { label: "Modell", key: "modelName" },
    { label: "Kategori", key: "category" },
    { label: "Garanti", key: "standardWarrantyMonths" },
    { label: "Serviceintervall", key: "standardServiceIntervalMonths" },
    { label: "Antal maskiner", key: "machineCount" },
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
        {sorted.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <Badge variant="secondary">{m.manufacturer}</Badge>
            </TableCell>
            <TableCell>
              <Link href={`/machine-models/${m.id}`} className="hover:underline font-medium">
                {m.modelName}
              </Link>
            </TableCell>
            <TableCell>{m.category ?? "—"}</TableCell>
            <TableCell>{m.standardWarrantyMonths} mån</TableCell>
            <TableCell>{m.standardServiceIntervalMonths} mån</TableCell>
            <TableCell>{m.machineCount}</TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              Inga modeller ännu.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
