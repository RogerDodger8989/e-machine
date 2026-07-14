"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE_VALUE = "__none__";
const NEW_VALUE = "__new__";

export interface CategoryOption {
  id: string;
  name: string;
}

/**
 * Låter användaren välja en befintlig kategori eller skriva en ny inline —
 * kategorier hanteras även samlat under Inställningar → Kategorier, men det
 * ska fortfarande gå snabbt att skapa en ny direkt när man lägger till en
 * modell. Väljer man befintlig skickas dess id (`categoryId`); skriver man en
 * ny skickas namnet (`newCategoryName`) och servern skapar (eller återanvänder)
 * kategorin.
 */
export function CategoryPicker({
  categories,
  defaultValue,
}: {
  categories: CategoryOption[];
  defaultValue?: CategoryOption | null;
}) {
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [pickedId, setPickedId] = useState(defaultValue?.id ?? "");
  const [newCategory, setNewCategory] = useState("");

  return (
    <div className="space-y-2">
      <input type="hidden" name="categoryId" value={mode === "pick" ? pickedId : ""} />
      <input type="hidden" name="newCategoryName" value={mode === "new" ? newCategory : ""} />
      <Label htmlFor="category-select">Kategori</Label>
      <Select
        value={mode === "new" ? NEW_VALUE : pickedId || NONE_VALUE}
        onValueChange={(v) => {
          if (!v) return;
          if (v === NEW_VALUE) {
            setMode("new");
          } else {
            setMode("pick");
            setPickedId(v === NONE_VALUE ? "" : v);
          }
        }}
        items={{
          [NONE_VALUE]: "Ingen kategori",
          ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
          [NEW_VALUE]: "+ Ny kategori…",
        }}
      >
        <SelectTrigger id="category-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>Ingen kategori</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
          <SelectItem value={NEW_VALUE}>+ Ny kategori…</SelectItem>
        </SelectContent>
      </Select>
      {mode === "new" && (
        <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Namn på ny kategori"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="newCategoryServiceIntervalMonths" className="text-xs text-muted-foreground">
                Serviceintervall (mån)
              </Label>
              <Input
                id="newCategoryServiceIntervalMonths"
                name="newCategoryServiceIntervalMonths"
                type="number"
                min={1}
                placeholder="valfritt"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newCategoryFirstServiceIntervalMonths" className="text-xs text-muted-foreground">
                Första servicen (mån)
              </Label>
              <Input
                id="newCategoryFirstServiceIntervalMonths"
                name="newCategoryFirstServiceIntervalMonths"
                type="number"
                min={1}
                placeholder="samma som ovan"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Valfritt — sätter kategorins standardvärde (kan ändras senare under Inställningar → Kategorier).
          </p>
        </div>
      )}
    </div>
  );
}
