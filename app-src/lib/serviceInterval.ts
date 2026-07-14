/**
 * Löser ut vilket serviceintervall som faktiskt gäller för en maskinmodell:
 * modellens egna värden vinner alltid om satta, annars ärvs kategorins
 * standardvärden, annars ett hårdkodat app-default (12 månader, samma
 * intervall för första som återkommande service om inget annat är satt).
 * Delas av lib/jobs/serviceReminders.ts (påminnelselogiken) och UI:t som
 * visar/redigerar en modells serviceintervall.
 */
/**
 * Läser ett valfritt månads-fält från ett formulär — ett tomt fält betyder
 * "ärv från kategori" (null), inte 0. Delas av alla ställen som sparar
 * standardServiceIntervalMonths/firstServiceIntervalMonths.
 */
export function parseOptionalMonths(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function resolveServiceIntervals(
  model: { standardServiceIntervalMonths: number | null; firstServiceIntervalMonths: number | null },
  category: { defaultServiceIntervalMonths: number | null; defaultFirstServiceIntervalMonths: number | null } | null
): { recurringMonths: number; firstMonths: number } {
  const recurringMonths = model.standardServiceIntervalMonths ?? category?.defaultServiceIntervalMonths ?? 12;
  const firstMonths = model.firstServiceIntervalMonths ?? category?.defaultFirstServiceIntervalMonths ?? recurringMonths;
  return { recurringMonths, firstMonths };
}
