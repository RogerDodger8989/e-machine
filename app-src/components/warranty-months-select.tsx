"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  WARRANTY_YEAR_OPTIONS,
  WARRANTY_MONTHS_SELECT_ITEMS,
  CUSTOM_WARRANTY_VALUE,
  monthsToPresetOrCustom,
} from "@/lib/warranty";

export function WarrantyMonthsSelect({
  defaultMonths = 24,
  id = "standardWarrantyMonths",
  required = true,
}: {
  defaultMonths?: number;
  id?: string;
  /** Sätt till false när fältet finns kvar i DOM men är dolt (t.ex. i en
   * hopfälld panel) — annars kan webbläsarens formulärvalidering blockera
   * inskickning för ett fält användaren inte kan se eller nå. */
  required?: boolean;
}) {
  const [selection, setSelection] = useState(() => monthsToPresetOrCustom(defaultMonths));
  const isCustom = selection === CUSTOM_WARRANTY_VALUE;

  return (
    <div className="space-y-1.5">
      <Select
        required={required}
        value={selection}
        onValueChange={(v) => v && setSelection(v)}
        items={WARRANTY_MONTHS_SELECT_ITEMS}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WARRANTY_YEAR_OPTIONS.map((y) => (
            <SelectItem key={y} value={String(y * 12)}>
              {y} år
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_WARRANTY_VALUE}>Egen (månader)</SelectItem>
        </SelectContent>
      </Select>
      {isCustom ? (
        <Input
          type="number"
          name="standardWarrantyMonths"
          min={1}
          required={required}
          defaultValue={defaultMonths}
          placeholder="Antal månader"
        />
      ) : (
        <input type="hidden" name="standardWarrantyMonths" value={selection} />
      )}
    </div>
  );
}
