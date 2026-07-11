import { prisma } from "@/lib/db";

/** Läser vald kategori från formuläret — antingen ett id på en befintlig
 * kategori (`categoryId`) eller ett namn på en ny som skrivits in inline
 * (`newCategoryName`, hanteras via `<CategoryPicker>`). En ny kategori
 * skapas (eller återanvänds om namnet redan finns) direkt här, så det inte
 * krävs ett extra steg via Inställningar → Kategorier bara för att lägga
 * till en modell. */
export async function resolveCategoryId(formData: FormData): Promise<string | null> {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (categoryId) return categoryId;

  const newName = String(formData.get("newCategoryName") ?? "").trim();
  if (!newName) return null;

  // SQLite stödjer inte case-insensitive matchning direkt — jämför i JS,
  // samma mönster som app/settings/categories/actions.ts. Annars skulle
  // t.ex. "Motorsåg" och "motorsåg" (skrivet inline här) kunna bli två
  // olika kategorier trots att den dedikerade Kategorier-sidan blockerar det.
  const existing = await prisma.category.findMany({ select: { id: true, name: true } });
  const match = existing.find((c) => c.name.toLowerCase() === newName.toLowerCase());
  if (match) return match.id;

  const category = await prisma.category.create({ data: { name: newName } });
  return category.id;
}
