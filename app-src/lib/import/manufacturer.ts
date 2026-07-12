/** Normaliserar en fritext-tillverkare från en importfil till exakt "Stiga"
 * eller "Stihl" (samma två värden som resten av appen förutsätter, t.ex.
 * badge-färgning på maskinlistan) — null om värdet inte känns igen. */
export function normalizeManufacturer(raw: string): "Stiga" | "Stihl" | null {
  const t = raw.trim().toLowerCase();
  if (t === "stiga") return "Stiga";
  if (t === "stihl") return "Stihl";
  return null;
}
