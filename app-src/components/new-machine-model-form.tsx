"use client";

import { useState, useTransition } from "react";
import { createMachineModel } from "@/app/machine-models/actions";
import { isRedirectError } from "@/lib/isRedirectError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";
import { WarrantyMonthsSelect } from "@/components/warranty-months-select";

export function NewMachineModelForm({ categories }: { categories: CategoryOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
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
      <div className="space-y-1.5">
        <Label htmlFor="manufacturer">Tillverkare *</Label>
        <Select name="manufacturer" required defaultValue="Stiga">
          <SelectTrigger id="manufacturer" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Stiga">Stiga</SelectItem>
            <SelectItem value="Stihl">Stihl</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="modelName">Modellnamn *</Label>
        <Input id="modelName" name="modelName" required placeholder="t.ex. Park Pro 900 WX" />
      </div>
      <CategoryPicker categories={categories} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="standardWarrantyMonths">Standardgaranti *</Label>
          <WarrantyMonthsSelect defaultMonths={24} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="standardServiceIntervalMonths">Serviceintervall (mån)</Label>
          <Input
            id="standardServiceIntervalMonths"
            name="standardServiceIntervalMonths"
            type="number"
            min={1}
            defaultValue={12}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar…" : "Spara modell"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
