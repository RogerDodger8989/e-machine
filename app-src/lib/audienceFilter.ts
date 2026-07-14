/**
 * Ren, klientsäker filtreringslogik för "riktad målgrupp" (tillverkare/
 * kategori/modell/inköpsår) — inga server-only-beroenden (ingen Prisma),
 * så den kan importeras direkt i "use client"-komponenter. Datainhämtningen
 * (som KRÄVER Prisma) ligger separat i lib/audienceBuilder.ts.
 */
export interface AudienceFilterValue {
  manufacturerId: string;
  categoryId: string;
  modelId: string;
  yearFrom: string;
  yearTo: string;
}

export const EMPTY_AUDIENCE_FILTER: AudienceFilterValue = {
  manufacturerId: "",
  categoryId: "",
  modelId: "",
  yearFrom: "",
  yearTo: "",
};

export function isAudienceFilterActive(filters: AudienceFilterValue): boolean {
  return !!(filters.manufacturerId || filters.categoryId || filters.modelId || filters.yearFrom || filters.yearTo);
}

export interface AudienceFilterableMachine {
  manufacturerId: string;
  categoryId: string | null;
  modelId: string;
  purchaseYear: number | null;
}

export function matchesAudienceFilter(machine: AudienceFilterableMachine, filters: AudienceFilterValue): boolean {
  if (filters.manufacturerId && machine.manufacturerId !== filters.manufacturerId) return false;
  if (filters.categoryId && machine.categoryId !== filters.categoryId) return false;
  if (filters.modelId && machine.modelId !== filters.modelId) return false;
  if (filters.yearFrom && (!machine.purchaseYear || machine.purchaseYear < Number(filters.yearFrom))) return false;
  if (filters.yearTo && (!machine.purchaseYear || machine.purchaseYear > Number(filters.yearTo))) return false;
  return true;
}
