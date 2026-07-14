"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// SQLite stödjer inte Prismas `mode: "insensitive"` — jämför case-insensitivt
// i JS istället, samma mönster som app/settings/categories/actions.ts.
async function assertNameAvailable(name: string, excludeId?: string) {
  const all = await prisma.manufacturer.findMany({ select: { id: true, name: true } });
  const clash = all.find((m) => m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId);
  if (clash) throw new Error(`Tillverkaren "${name}" finns redan`);
}

export async function createManufacturer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Namn krävs");
  await assertNameAvailable(name);

  await prisma.manufacturer.create({ data: { name } });

  revalidatePath("/settings/manufacturers");
  revalidatePath("/machine-models");
}

export async function updateManufacturer(manufacturerId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Namn krävs");
  await assertNameAvailable(name, manufacturerId);

  await prisma.manufacturer.update({ where: { id: manufacturerId }, data: { name } });

  revalidatePath("/settings/manufacturers");
  revalidatePath("/machine-models");
}

/**
 * Tar bort en tillverkare — till skillnad från kategorier blockeras detta om
 * någon maskinmodell använder den (manufacturerId är obligatoriskt på
 * MachineModel, ingen SetNull-väg finns).
 */
export async function deleteManufacturer(manufacturerId: string) {
  const modelCount = await prisma.machineModel.count({ where: { manufacturerId } });
  if (modelCount > 0) {
    throw new Error(
      `Kan inte ta bort — ${modelCount} maskinmodell${modelCount === 1 ? "" : "er"} använder den här tillverkaren.`
    );
  }

  await prisma.manufacturer.delete({ where: { id: manufacturerId } });

  revalidatePath("/settings/manufacturers");
}
