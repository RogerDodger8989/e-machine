/** Tolkar ett datumvärde från en importfil till ett giltigt Date, eller null
 * om värdet saknas eller inte går att tolka — skriver aldrig ett Invalid Date
 * till databasen, hoppar bara över det fältet för raden. */
export function parseImportDate(raw: string): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
