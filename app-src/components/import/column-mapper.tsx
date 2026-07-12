"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ColumnMapping, TargetField } from "@/lib/import/mapping";

const UNMAPPED = "__unmapped__";

export function ColumnMapper({
  detectedColumns,
  targetFields,
  mapping,
  onChange,
}: {
  detectedColumns: string[];
  targetFields: TargetField[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}) {
  const items: Record<string, string> = {
    [UNMAPPED]: "(Ingen)",
    ...Object.fromEntries(detectedColumns.map((c) => [c, c])),
  };

  function setField(fieldKey: string, column: string) {
    onChange({ ...mapping, [fieldKey]: column === UNMAPPED ? null : column });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {targetFields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`map-${field.key}`}>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={mapping[field.key] ?? UNMAPPED}
            onValueChange={(v) => v && setField(field.key, v)}
            items={items}
          >
            <SelectTrigger id={`map-${field.key}`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNMAPPED}>(Ingen)</SelectItem>
              {detectedColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
