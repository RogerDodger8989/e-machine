import { prisma } from "@/lib/db";
import { findOrCreateManufacturerId } from "@/lib/manufacturers";

/**
 * Hittar en befintlig maskinmodell (tillverkare + modellnamn, skiftlägesokänsligt)
 * eller skapar en ny om ingen matchar. SQLite stödjer inte case-insensitive
 * matchning direkt, så jämförelsen görs i JS — samma mönster som används för
 * kategorier (lib/categories.ts) och kunder (lib/import/matchCustomer.ts).
 * Delas mellan det vanliga maskinformuläret (app/machines/actions.ts) och
 * garanti-/ägandeimporten, så en modell aldrig dupliceras oavsett väg in.
 * `manufacturer` tas emot som ett namn (fri text) — importflödena har bara
 * det, inte ett id — och slås upp eller skapas via findOrCreateManufacturerId().
 */
export async function findOrCreateMachineModel(
  manufacturer: string,
  modelName: string,
  opts?: {
    categoryId?: string | null;
    standardWarrantyMonths?: number;
    // undefined = inget angivet, default till 12 (t.ex. importflöden som
    // inte känner till kategori-ärvning). Explicit `null` = låt fältet
    // vara null i databasen så det ärver kategorins standardvärde istället
    // (lib/serviceInterval.ts) — används av det interaktiva formuläret.
    standardServiceIntervalMonths?: number | null;
    firstServiceIntervalMonths?: number | null;
  }
): Promise<string> {
  const manufacturerId = await findOrCreateManufacturerId(manufacturer);

  const existing = await prisma.machineModel.findMany({
    where: { manufacturerId },
    select: { id: true, modelName: true },
  });
  const match = existing.find((m) => m.modelName.toLowerCase() === modelName.toLowerCase());
  if (match) return match.id;

  const model = await prisma.machineModel.create({
    data: {
      manufacturerId,
      modelName,
      categoryId: opts?.categoryId ?? null,
      standardWarrantyMonths: opts?.standardWarrantyMonths ?? 24,
      standardServiceIntervalMonths:
        opts?.standardServiceIntervalMonths === undefined ? 12 : opts.standardServiceIntervalMonths,
      firstServiceIntervalMonths: opts?.firstServiceIntervalMonths ?? null,
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
