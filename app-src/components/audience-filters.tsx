"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EMPTY_AUDIENCE_FILTER, isAudienceFilterActive, type AudienceFilterValue } from "@/lib/audienceFilter";
import type { AudienceFilterOptions } from "@/lib/audienceBuilder";

const ALL = "__all__";

export function AudienceFilterControls({
  value,
  onChange,
  manufacturers,
  categories,
  models,
}: AudienceFilterOptions & {
  value: AudienceFilterValue;
  onChange: (value: AudienceFilterValue) => void;
}) {
  // Modellistan begränsas till redan vald tillverkare/kategori, så man inte
  // kan välja en modell som ändå inte skulle ge några träffar.
  const filteredModels = models.filter(
    (m) =>
      (!value.manufacturerId || m.manufacturerId === value.manufacturerId) &&
      (!value.categoryId || m.categoryId === value.categoryId)
  );

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Tillverkare</Label>
        <Select
          value={value.manufacturerId || ALL}
          onValueChange={(v) => v && onChange({ ...value, manufacturerId: v === ALL ? "" : v, modelId: "" })}
          items={{ [ALL]: "Alla", ...Object.fromEntries(manufacturers.map((m) => [m.id, m.name])) }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alla</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Kategori</Label>
        <Select
          value={value.categoryId || ALL}
          onValueChange={(v) => v && onChange({ ...value, categoryId: v === ALL ? "" : v, modelId: "" })}
          items={{ [ALL]: "Alla", ...Object.fromEntries(categories.map((c) => [c.id, c.name])) }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alla</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Modell</Label>
        <Select
          value={value.modelId || ALL}
          onValueChange={(v) => v && onChange({ ...value, modelId: v === ALL ? "" : v })}
          items={{ [ALL]: "Alla", ...Object.fromEntries(filteredModels.map((m) => [m.id, m.label])) }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alla</SelectItem>
            {filteredModels.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Inköpsår från</Label>
        <Input
          type="number"
          className="w-28"
          value={value.yearFrom}
          onChange={(e) => onChange({ ...value, yearFrom: e.target.value })}
          placeholder="t.ex. 2023"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Inköpsår till</Label>
        <Input
          type="number"
          className="w-28"
          value={value.yearTo}
          onChange={(e) => onChange({ ...value, yearTo: e.target.value })}
          placeholder="t.ex. 2024"
        />
      </div>

      {isAudienceFilterActive(value) && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(EMPTY_AUDIENCE_FILTER)}>
          Rensa filter
        </Button>
      )}
    </div>
  );
}
