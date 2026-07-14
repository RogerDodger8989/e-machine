/** Trimmar en fritext-tillverkare från en importfil — null om raden saknar
 * värde. Tillverkare är en öppen, hanterad lista (Inställningar →
 * Tillverkare) sedan tidigare hårdkodning till exakt Stiga/Stihl togs bort,
 * så vilket namn som helst är giltigt här; findOrCreateMachineModel()
 * matchar mot befintliga tillverkare skiftlägesokänsligt eller skapar en ny. */
export function normalizeManufacturer(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed || null;
}
