"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type PreviewRowStatus = "new" | "update" | "warning" | "skip";

export interface PreviewRow {
  rowIndex: number;
  status: PreviewRowStatus;
  message: string;
  summary: string;
}

const STATUS_LABEL: Record<PreviewRowStatus, string> = {
  new: "Ny",
  update: "Uppdateras",
  warning: "Varning",
  skip: "Hoppas över",
};
const STATUS_VARIANT: Record<PreviewRowStatus, "default" | "secondary" | "destructive"> = {
  new: "default",
  update: "secondary",
  warning: "secondary",
  skip: "destructive",
};

export function ImportPreviewTable({ rows }: { rows: PreviewRow[] }) {
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status]++;
      return acc;
    },
    { new: 0, update: 0, warning: 0, skip: 0 } as Record<PreviewRowStatus, number>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          <strong className="tabular-nums">{counts.new}</strong> nya
        </span>
        <span>
          <strong className="tabular-nums">{counts.update}</strong> uppdateras
        </span>
        {counts.warning > 0 && (
          <span className="text-amber-600 dark:text-amber-500">
            <strong className="tabular-nums">{counts.warning}</strong> varningar
          </span>
        )}
        {counts.skip > 0 && (
          <span className="text-destructive">
            <strong className="tabular-nums">{counts.skip}</strong> hoppas över
          </span>
        )}
      </div>
      <div className="max-h-96 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rad</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Innehåll</TableHead>
              <TableHead>Meddelande</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.rowIndex}>
                <TableCell className="text-muted-foreground">{r.rowIndex}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={r.summary}>
                  {r.summary}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.message}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Inga rader att visa.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
