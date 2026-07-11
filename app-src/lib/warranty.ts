export const WARRANTY_YEAR_OPTIONS = [1, 2, 3, 5, 10] as const;
export type WarrantyYears = (typeof WARRANTY_YEAR_OPTIONS)[number];

export const CUSTOM_WARRANTY_VALUE = "custom";

/** Presetlistan för maskinens garantitid (år) + ett "eget datum"-alternativ,
 * använd i Select `items`-prop. */
export const WARRANTY_SELECT_ITEMS: Record<string, string> = {
  ...Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((y) => [String(y), `${y} år`])),
  [CUSTOM_WARRANTY_VALUE]: "Eget datum",
};

/** Presetlistan för modellens standardgaranti (månader) + ett "eget"-alternativ. */
export const WARRANTY_MONTHS_SELECT_ITEMS: Record<string, string> = {
  ...Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((y) => [String(y * 12), `${y} år`])),
  [CUSTOM_WARRANTY_VALUE]: "Egen (månader)",
};

/** Matchar ett månadsvärde mot en preset-år, eller "custom" om det inte
 * exakt motsvarar någon av dem (t.ex. en egen inskriven garantitid). */
export function monthsToPresetOrCustom(months: number): string {
  const years = months / 12;
  return (WARRANTY_YEAR_OPTIONS as readonly number[]).includes(years) ? String(years) : CUSTOM_WARRANTY_VALUE;
}

/** Härleder vilket Select-värde (preset-år eller "custom") en befintlig
 * maskins garanti motsvarar, utifrån mellanskillnaden mellan inköpsdatum och
 * garantins slutdatum — används för att förvälja rätt läge i
 * redigeringsformuläret. */
export function warrantySelectionFromDates(
  purchaseDate: Date | null,
  warrantyEndDate: Date | null
): string {
  if (!purchaseDate || !warrantyEndDate) return CUSTOM_WARRANTY_VALUE;
  const months =
    (warrantyEndDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
    (warrantyEndDate.getMonth() - purchaseDate.getMonth());
  return monthsToPresetOrCustom(months);
}
