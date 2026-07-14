"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";
import { ManufacturerPicker, type ManufacturerOption } from "@/components/manufacturer-picker";
import { WarrantyMonthsSelect } from "@/components/warranty-months-select";
import { NEW_MODEL_SENTINEL } from "@/lib/machineModels";

export interface ModelOption {
  id: string;
  manufacturer: string;
  modelName: string;
  standardWarrantyMonths: number;
}

/**
 * Modell-Select med ett "+ Ny modell…"-alternativ — väljer man det fälls en
 * panel ut under själva selecten där man skapar modellen direkt (tillverkare,
 * modellnamn, kategori, standardgaranti, serviceintervall), utan att behöva
 * lämna maskinformuläret. Servern (`resolveModelId` i
 * `app/machines/actions.ts`) skapar modellen från de fälten om Select:et
 * står på sentinelvärdet vid inskickning.
 */
export function ModelPicker({
  models,
  categories,
  manufacturers,
  initialModelId,
  onModelChange,
}: {
  models: ModelOption[];
  categories: CategoryOption[];
  manufacturers: ManufacturerOption[];
  initialModelId?: string;
  onModelChange?: (model: ModelOption | null) => void;
}) {
  const [value, setValue] = useState(initialModelId ?? "");
  const isNew = value === NEW_MODEL_SENTINEL;

  function handleChange(v: string | null) {
    if (!v) return;
    setValue(v);
    onModelChange?.(v === NEW_MODEL_SENTINEL ? null : models.find((m) => m.id === v) ?? null);
  }

  return (
    <div className="space-y-1.5">
      <Select
        name="modelId"
        required
        value={value}
        onValueChange={handleChange}
        items={{
          ...Object.fromEntries(models.map((m) => [m.id, `${m.manufacturer} ${m.modelName}`])),
          [NEW_MODEL_SENTINEL]: "+ Ny modell…",
        }}
      >
        <SelectTrigger id="modelId" className="w-full">
          <SelectValue placeholder="Välj modell" />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.manufacturer} {m.modelName}
            </SelectItem>
          ))}
          <SelectItem value={NEW_MODEL_SENTINEL}>
            <Plus className="size-3.5" />
            Ny modell…
          </SelectItem>
        </SelectContent>
      </Select>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isNew ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "mt-2 space-y-3 rounded-lg border bg-muted/40 p-3 transition-opacity duration-300",
              isNew ? "opacity-100 delay-150" : "opacity-0"
            )}
          >
            <p className="text-sm font-medium">Ny maskinmodell</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ManufacturerPicker manufacturers={manufacturers} required={isNew} />
              <div className="space-y-1.5">
                <Label htmlFor="modelName">Modellnamn *</Label>
                <Input
                  id="modelName"
                  name="modelName"
                  required={isNew}
                  placeholder="t.ex. Park Pro 900 WX"
                />
              </div>
            </div>
            <CategoryPicker categories={categories} />
            <div className="space-y-1.5">
              <Label htmlFor="standardWarrantyMonths">Standardgaranti *</Label>
              <WarrantyMonthsSelect defaultMonths={24} required={isNew} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="standardServiceIntervalMonths">Serviceintervall (mån)</Label>
                <Input
                  id="standardServiceIntervalMonths"
                  name="standardServiceIntervalMonths"
                  type="number"
                  min={1}
                  placeholder="Ärv från kategori"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstServiceIntervalMonths">Första servicen (mån)</Label>
                <Input
                  id="firstServiceIntervalMonths"
                  name="firstServiceIntervalMonths"
                  type="number"
                  min={1}
                  placeholder="Samma som ovan"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
