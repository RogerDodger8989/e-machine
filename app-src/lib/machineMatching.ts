import { prisma } from "@/lib/db";

/**
 * Hittar en befintlig maskinmodell (tillverkare + modellnamn, skiftlägesokänsligt)
 * eller skapar en ny om ingen matchar. SQLite stödjer inte case-insensitive
 * matchning direkt, så jämförelsen görs i JS — samma mönster som används för
 * kategorier (lib/categories.ts) och kunder (lib/import/matchCustomer.ts).
 * Delas mellan det vanliga maskinformuläret (app/machines/actions.ts) och
 * garanti-/ägandeimporten, så en modell aldrig dupliceras oavsett väg in.
 */
export async function findOrCreateMachineModel(
  manufacturer: string,
  modelName: string,
  opts?: { categoryId?: string | null; standardWarrantyMonths?: number; standardServiceIntervalMonths?: number }
): Promise<string> {
  const existing = await prisma.machineModel.findMany({
    where: { manufacturer },
    select: { id: true, modelName: true },
  });
  const match = existing.find((m) => m.modelName.toLowerCase() === modelName.toLowerCase());
  if (match) return match.id;

  const model = await prisma.machineModel.create({
    data: {
      manufacturer,
      modelName,
      categoryId: opts?.categoryId ?? null,
      standardWarrantyMonths: opts?.standardWarrantyMonths ?? 24,
      standardServiceIntervalMonths: opts?.standardServiceIntervalMonths ?? 12,
    },
  });
  return model.id;
}

/** Hittar en maskin på serienummer, skiftlägesokänsligt. */
export async function findMachineBySerialNumber(serialNumber: string): Promise<{ id: string } | null> {
  const existing = await prisma.machine.findMany({ select: { id: true, serialNumber: true } });
  const match = existing.find((m) => m.serialNumber.toLowerCase() === serialNumber.toLowerCase());
  return match ? { id: match.id } : null;
}

/** Kastar om serienumret redan är registrerat på en ANNAN maskin än excludeId. */
export async function assertSerialNumberAvailable(serialNumber: string, excludeId?: string): Promise<void> {
  const existing = await prisma.machine.findMany({ select: { id: true, serialNumber: true } });
  const clash = existing.find(
    (m) => m.serialNumber.toLowerCase() === serialNumber.toLowerCase() && m.id !== excludeId
  );
  if (clash) throw new Error(`Serienumret "${serialNumber}" finns redan registrerat`);
}
