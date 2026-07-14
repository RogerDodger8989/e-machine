"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NEW_VALUE = "__new__";

export interface ManufacturerOption {
  id: string;
  name: string;
}

/**
 * Låter användaren välja en befintlig tillverkare eller skriva en ny inline
 * — samma mönster som <CategoryPicker>, men tillverkare är obligatoriskt
 * (ingen "Ingen tillverkare"-väg). Väljer man befintlig skickas dess id
 * (`manufacturerId`); skriver man en ny skickas namnet (`newManufacturerName`)
 * och servern skapar (eller återanvänder) tillverkaren via
 * lib/manufacturers.ts's resolveManufacturerId().
 */
export function ManufacturerPicker({
  manufacturers,
  defaultValue,
  required = true,
}: {
  manufacturers: ManufacturerOption[];
  defaultValue?: ManufacturerOption | null;
  required?: boolean;
}) {
  const [mode, setMode] = useState<"pick" | "new">(defaultValue ? "pick" : manufacturers.length > 0 ? "pick" : "new");
  const [pickedId, setPickedId] = useState(defaultValue?.id ?? manufacturers[0]?.id ?? "");
  const [newManufacturer, setNewManufacturer] = useState("");

  return (
    <div className="space-y-2">
      <input type="hidden" name="manufacturerId" value={mode === "pick" ? pickedId : ""} />
      <input type="hidden" name="newManufacturerName" value={mode === "new" ? newManufacturer : ""} />
      <Label htmlFor="manufacturer-select">Tillverkare {required && <span className="text-destructive">*</span>}</Label>
      <Select
        value={mode === "new" ? NEW_VALUE : pickedId}
        onValueChange={(v) => {
          if (!v) return;
          if (v === NEW_VALUE) {
            setMode("new");
          } else {
            setMode("pick");
            setPickedId(v);
          }
        }}
        items={{
          ...Object.fromEntries(manufacturers.map((m) => [m.id, m.name])),
          [NEW_VALUE]: "+ Ny tillverkare…",
        }}
      >
        <SelectTrigger id="manufacturer-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {manufacturers.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
          <SelectItem value={NEW_VALUE}>+ Ny tillverkare…</SelectItem>
        </SelectContent>
      </Select>
      {mode === "new" && (
        <Input
          value={newManufacturer}
          onChange={(e) => setNewManufacturer(e.target.value)}
          placeholder="Namn på ny tillverkare"
          autoFocus
        />
      )}
    </div>
  );
}
