"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { addMonths } from "@/lib/date";
import { CUSTOM_WARRANTY_VALUE } from "@/lib/warranty";
import { resolveCategoryId } from "@/lib/categories";
import { NEW_MODEL_SENTINEL } from "@/lib/machineModels";
import { findOrCreateMachineModel, assertSerialNumberAvailable } from "@/lib/machineMatching";

/** Garantitiden väljs antingen som ett antal år (1/2/3/5/10) räknat från
 * inköpsdatum, eller som ett eget datum ("Eget datum" i Select:et) — då
 * används det inskrivna datumet direkt istället för att räknas ut. */
function resolveWarrantyEndDate(
  warrantyYearsRaw: string,
  purchaseDate: Date | null,
  customEndDateRaw: string
): Date | null {
  if (warrantyYearsRaw === CUSTOM_WARRANTY_VALUE) {
    return customEndDateRaw ? new Date(customEndDateRaw) : null;
  }
  if (!purchaseDate) {
    // Utan inköpsdatum går garantitiden inte att räkna ut — utan denna
    // kontroll sparades garantidatumet tyst som null, vilket ser ut som att
    // maskinen saknar garanti trots att en garantitid faktiskt valdes.
    throw new Error("Inköpsdatum krävs för att beräkna garantitiden — eller välj \"Eget datum\" istället.");
  }
  return addMonths(purchaseDate, Number(warrantyYearsRaw) * 12);
}

/** Om modell-Select:et står på "+ Ny modell…" skapas modellen (eller
 * återanvänds om tillverkare+modellnamn redan finns) från de fält som
 * `<ModelPicker>` skickar med, istället för att kräva ett separat besök på
 * Modeller-sidan innan man kan registrera maskinen. */
async function resolveModelId(formData: FormData): Promise<string> {
  const modelId = String(formData.get("modelId") ?? "");
  if (modelId && modelId !== NEW_MODEL_SENTINEL) return modelId;

  const manufacturer = String(formData.get("manufacturer") ?? "");
  const modelName = String(formData.get("modelName") ?? "").trim();
  if (manufacturer !== "Stiga" && manufacturer !== "Stihl") {
    throw new Error("Tillverkare måste vara Stiga eller Stihl");
  }
  if (!modelName) throw new Error("Modellnamn krävs för ny modell");

  const categoryId = await resolveCategoryId(formData);
  const standardWarrantyMonths = Number(formData.get("standardWarrantyMonths") ?? 24);
  const standardServiceIntervalMonths = Number(formData.get("standardServiceIntervalMonths") ?? 12);

  return findOrCreateMachineModel(manufacturer, modelName, {
    categoryId,
    standardWarrantyMonths,
    standardServiceIntervalMonths,
  });
}

export async function createMachine(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const purchaseDateRaw = String(formData.get("purchaseDate") ?? "");
  const warrantyYearsRaw = String(formData.get("warrantyYears") ?? "");
  const warrantyEndDateRaw = String(formData.get("warrantyEndDate") ?? "");

  if (!customerId) throw new Error("Kund krävs");
  if (!serialNumber) throw new Error("Serienummer krävs");
  if (!warrantyYearsRaw) throw new Error("Garantitid krävs");
  await assertSerialNumberAvailable(serialNumber);

  const modelId = await resolveModelId(formData);
  const purchaseDate = purchaseDateRaw ? new Date(purchaseDateRaw) : null;
  const warrantyEndDate = resolveWarrantyEndDate(warrantyYearsRaw, purchaseDate, warrantyEndDateRaw);
  const offersPickupService = formData.get("offersPickupService") === "on";

  const machine = await prisma.machine.create({
    data: {
      modelId,
      serialNumber,
      purchaseDate,
      warrantyEndDate,
      offersPickupService,
      ownerships: {
        create: { customerId },
      },
    },
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/machines");
  revalidatePath(`/machine-models/${modelId}`);
  redirect(`/machines/${machine.id}`);
}

export async function updateMachine(machineId: string, formData: FormData) {
  const modelId = String(formData.get("modelId") ?? "");
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const purchaseDateRaw = String(formData.get("purchaseDate") ?? "");
  const warrantyYearsRaw = String(formData.get("warrantyYears") ?? "");
  const warrantyEndDateRaw = String(formData.get("warrantyEndDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!modelId) throw new Error("Modell krävs");
  if (!serialNumber) throw new Error("Serienummer krävs");
  if (!warrantyYearsRaw) throw new Error("Garantitid krävs");
  await assertSerialNumberAvailable(serialNumber, machineId);

  const purchaseDate = purchaseDateRaw ? new Date(purchaseDateRaw) : null;
  const warrantyEndDate = resolveWarrantyEndDate(warrantyYearsRaw, purchaseDate, warrantyEndDateRaw);
  const offersPickupService = formData.get("offersPickupService") === "on";

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      modelId,
      serialNumber,
      purchaseDate,
      warrantyEndDate,
      notes,
      offersPickupService,
    },
  });

  revalidatePath(`/machines/${machineId}`);
  revalidatePath("/machines");
  redirect(`/machines/${machineId}`);
}

/**
 * Frikopplar en maskin från sin nuvarande ägare (t.ex. såld eller skrotad) utan att
 * radera maskinen eller dess service­historik.
 */
export async function unlinkMachine(machineId: string, reason: string) {
  const active = await prisma.machineOwnership.findFirst({
    where: { machineId, ownedUntil: null },
  });
  if (!active) return;

  await prisma.machineOwnership.update({
    where: { id: active.id },
    data: { ownedUntil: new Date(), unlinkReason: reason },
  });

  revalidatePath(`/machines/${machineId}`);
  revalidatePath(`/customers/${active.customerId}`);
}
