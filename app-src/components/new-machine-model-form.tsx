"use client";

import { useState, useTransition } from "react";
import { createMachineModel } from "@/app/machine-models/actions";
import { isRedirectError } from "@/lib/isRedirectError";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";
import { ManufacturerPicker, type ManufacturerOption } from "@/components/manufacturer-picker";
import { WarrantyMonthsSelect } from "@/components/warranty-months-select";

export interface CampaignSheetTemplateOption {
  id: string;
  key: string;
}

export function NewMachineModelForm({
  categories,
  manufacturers,
  campaignSheetTemplates,
}: {
  categories: CategoryOption[];
  manufacturers: ManufacturerOption[];
  campaignSheetTemplates: CampaignSheetTemplateOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());

  function toggleTemplate(id: string) {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    selectedTemplateIds.forEach((id) => formData.append("campaignSheetTemplateIds", id));
    startTransition(async () => {
      try {
        await createMachineModel(formData);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ManufacturerPicker manufacturers={manufacturers} />
      <div className="space-y-1.5">
        <Label htmlFor="modelName">Modellnamn *</Label>
        <Input id="modelName" name="modelName" required placeholder="t.ex. Park Pro 900 WX" />
      </div>
      <CategoryPicker categories={categories} />
      <div className="space-y-1.5">
        <Label htmlFor="standardWarrantyMonths">Standardgaranti *</Label>
        <WarrantyMonthsSelect defaultMonths={24} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      {campaignSheetTemplates.length > 0 && (
        <div className="space-y-1.5">
          <Label>Kampanjblad</Label>
          <div className="space-y-1.5 border rounded-md p-3">
            {campaignSheetTemplates.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedTemplateIds.has(t.id)}
                  onCheckedChange={() => toggleTemplate(t.id)}
                />
                {t.key}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Maskiner av denna modell får en &quot;Skriv ut kampanjblad&quot;-knapp om minst en mall är ikryssad.
          </p>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar…" : "Spara modell"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
