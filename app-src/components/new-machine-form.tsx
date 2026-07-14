"use client";

import { useState, useTransition } from "react";
import { createMachine } from "@/app/machines/actions";
import { isRedirectError } from "@/lib/isRedirectError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerPicker, type CustomerOption } from "@/components/customer-picker";
import { ModelPicker, type ModelOption } from "@/components/model-picker";
import { type CategoryOption } from "@/components/category-picker";
import { type ManufacturerOption } from "@/components/manufacturer-picker";
import { WARRANTY_YEAR_OPTIONS, WARRANTY_SELECT_ITEMS, CUSTOM_WARRANTY_VALUE, monthsToPresetOrCustom } from "@/lib/warranty";

export function NewMachineForm({
  customers,
  models,
  categories,
  manufacturers,
  initialCustomerId,
  initialModelId,
}: {
  customers: CustomerOption[];
  models: ModelOption[];
  categories: CategoryOption[];
  manufacturers: ManufacturerOption[];
  initialCustomerId?: string;
  initialModelId?: string;
}) {
  const [hasCustomer, setHasCustomer] = useState(!!initialCustomerId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialModel = models.find((m) => m.id === initialModelId);
  const [warrantySelection, setWarrantySelection] = useState(
    monthsToPresetOrCustom(initialModel?.standardWarrantyMonths ?? 24)
  );
  const isCustomWarranty = warrantySelection === CUSTOM_WARRANTY_VALUE;

  function handleModelChange(model: ModelOption | null) {
    if (model) setWarrantySelection(monthsToPresetOrCustom(model.standardWarrantyMonths));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createMachine(formData);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Kund *</Label>
        <CustomerPicker
          customers={customers}
          initialCustomerId={initialCustomerId}
          onSelectionChange={(id) => setHasCustomer(!!id)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="modelId">Modell *</Label>
        <ModelPicker
          models={models}
          categories={categories}
          manufacturers={manufacturers}
          initialModelId={initialModelId}
          onModelChange={handleModelChange}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="serialNumber">Serienummer *</Label>
        <Input id="serialNumber" name="serialNumber" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="purchaseDate">Inköpsdatum</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="warrantyYears">Garantitid *</Label>
          <Select
            name="warrantyYears"
            required
            value={warrantySelection}
            onValueChange={(v) => v && setWarrantySelection(v)}
            items={WARRANTY_SELECT_ITEMS}
          >
            <SelectTrigger id="warrantyYears" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WARRANTY_YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} år
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_WARRANTY_VALUE}>Eget datum</SelectItem>
            </SelectContent>
          </Select>
          {isCustomWarranty ? (
            <Input id="warrantyEndDate" name="warrantyEndDate" type="date" required />
          ) : (
            <p className="text-xs text-muted-foreground">
              Förvalt utifrån modellens standardgaranti — ändra vid behov (t.ex. köpt
              garantiförlängning).
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={!hasCustomer || isPending}>
          {isPending ? "Sparar…" : "Spara maskin"}
        </Button>
        {!hasCustomer && <p className="text-xs text-muted-foreground">Välj en kund först.</p>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
