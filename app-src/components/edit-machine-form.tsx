"use client";

import { useState, useTransition } from "react";
import { updateMachine } from "@/app/machines/actions";
import { isRedirectError } from "@/lib/isRedirectError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WARRANTY_YEAR_OPTIONS, WARRANTY_SELECT_ITEMS, CUSTOM_WARRANTY_VALUE, monthsToPresetOrCustom } from "@/lib/warranty";

interface MachineModelOption {
  id: string;
  manufacturer: string;
  modelName: string;
  standardWarrantyMonths: number;
}

export function EditMachineForm({
  machineId,
  models,
  initialModelId,
  serialNumber,
  purchaseDate,
  notes,
  initialWarrantySelection,
  initialWarrantyEndDate,
}: {
  machineId: string;
  models: MachineModelOption[];
  initialModelId: string;
  serialNumber: string;
  purchaseDate: string;
  notes: string;
  initialWarrantySelection: string;
  initialWarrantyEndDate: string;
}) {
  const [warrantySelection, setWarrantySelection] = useState(initialWarrantySelection);
  const isCustomWarranty = warrantySelection === CUSTOM_WARRANTY_VALUE;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleModelChange(modelId: string | null) {
    const model = models.find((m) => m.id === modelId);
    if (model) setWarrantySelection(monthsToPresetOrCustom(model.standardWarrantyMonths));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateMachine(machineId, formData);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="modelId">Modell *</Label>
        <Select
          name="modelId"
          required
          defaultValue={initialModelId}
          onValueChange={handleModelChange}
          items={Object.fromEntries(models.map((m) => [m.id, `${m.manufacturer} ${m.modelName}`]))}
        >
          <SelectTrigger id="modelId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.manufacturer} {m.modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="serialNumber">Serienummer *</Label>
        <Input id="serialNumber" name="serialNumber" required defaultValue={serialNumber} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="purchaseDate">Inköpsdatum</Label>
          <Input id="purchaseDate" name="purchaseDate" type="date" defaultValue={purchaseDate} />
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
          {isCustomWarranty && (
            <Input
              id="warrantyEndDate"
              name="warrantyEndDate"
              type="date"
              required
              defaultValue={initialWarrantyEndDate}
            />
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Anteckningar</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={notes} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar…" : "Spara ändringar"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
