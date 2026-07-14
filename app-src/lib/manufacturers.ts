import { prisma } from "@/lib/db";

/**
 * Hittar en tillverkare på namn (skiftlägesokänsligt, SQLite saknar
 * case-insensitive matchning direkt) eller skapar en ny. Används av
 * resolveManufacturerId() nedan, och av importflödena som bara har ett
 * tillverkarnamn som fri text (t.ex. från en CSV-kolumn eller en
 * Stiga/Stihl-portal), via lib/machineMatching.ts.
 */
export async function findOrCreateManufacturerId(name: string): Promise<string> {
  const existing = await prisma.manufacturer.findMany({ select: { id: true, name: true } });
  const match = existing.find((m) => m.name.toLowerCase() === name.toLowerCase());
  if (match) return match.id;

  const manufacturer = await prisma.manufacturer.create({ data: { name } });
  return manufacturer.id;
}

/**
 * Läser vald tillverkare från formuläret — antingen ett id på en befintlig
 * tillverkare (`manufacturerId`) eller ett namn på en ny som skrivits in
 * inline (`newManufacturerName`, hanteras via <ManufacturerPicker>). Samma
 * mönster som lib/categories.ts's resolveCategoryId(), men tillverkare är
 * obligatoriskt (kategori är valfri) så ett tomt val kastar ett fel istället
 * för att falla tillbaka på null.
 */
export async function resolveManufacturerId(formData: FormData): Promise<string> {
  const manufacturerId = String(formData.get("manufacturerId") ?? "").trim();
  if (manufacturerId) return manufacturerId;

  const newName = String(formData.get("newManufacturerName") ?? "").trim();
  if (!newName) throw new Error("Tillverkare krävs");

  return findOrCreateManufacturerId(newName);
}
