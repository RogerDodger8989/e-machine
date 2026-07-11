"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// SQLite stödjer inte Prismas `mode: "insensitive"` — jämför case-insensitivt
// i JS istället (fåtal rader, inget prestandaproblem).
async function assertNameAvailable(name: string, excludeId?: string) {
  const all = await prisma.category.findMany({ select: { id: true, name: true } });
  const clash = all.find((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId);
  if (clash) throw new Error(`Kategorin "${name}" finns redan`);
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Namn krävs");
  await assertNameAvailable(name);

  await prisma.category.create({ data: { name } });

  revalidatePath("/settings/categories");
  revalidatePath("/machine-models");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Namn krävs");
  await assertNameAvailable(name, categoryId);

  await prisma.category.update({ where: { id: categoryId }, data: { name } });

  revalidatePath("/settings/categories");
  revalidatePath("/machine-models");
}

/**
 * Tar bort en kategori. Modeller som använde den blir okategoriserade
 * (`onDelete: SetNull` i schemat) istället för att raderingen blockeras
 * eller modellerna följer med.
 */
export async function deleteCategory(categoryId: string) {
  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/settings/categories");
  revalidatePath("/machine-models");
}
