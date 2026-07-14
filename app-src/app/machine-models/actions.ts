"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveCategoryId } from "@/lib/categories";
import { resolveManufacturerId } from "@/lib/manufacturers";
import { parseOptionalMonths } from "@/lib/serviceInterval";
import type { Prisma } from "@/app/generated/prisma/client";

// SQLite stödjer inte case-insensitive matchning direkt — jämför i JS,
// samma mönster som app/settings/categories/actions.ts.
async function assertModelAvailable(manufacturerId: string, modelName: string) {
  const existing = await prisma.machineModel.findMany({ where: { manufacturerId }, select: { modelName: true } });
  const clash = existing.find((m) => m.modelName.toLowerCase() === modelName.toLowerCase());
  if (clash) throw new Error(`Modellen "${modelName}" finns redan för den här tillverkaren`);
}

/** Ersätter modellens kopplade kampanjblad med de ikryssade — jointabellen
 * har ingen egen data utöver skapad-tid, så inget går förlorat på att
 * radera och skapa om den vid varje spar (samma sync-strategi vid create
 * och update). */
async function syncCampaignSheetLinks(
  tx: Prisma.TransactionClient,
  machineModelId: string,
  formData: FormData
) {
  const templateIds = formData.getAll("campaignSheetTemplateIds").map(String).filter(Boolean);
  await tx.machineModelCampaignSheetTemplate.deleteMany({ where: { machineModelId } });
  if (templateIds.length > 0) {
    await tx.machineModelCampaignSheetTemplate.createMany({
      data: templateIds.map((templateId) => ({ machineModelId, templateId })),
    });
  }
}

export async function createMachineModel(formData: FormData) {
  const modelName = String(formData.get("modelName") ?? "").trim();
  const standardWarrantyMonths = Number(formData.get("standardWarrantyMonths") ?? 24);
  const standardServiceIntervalMonths = parseOptionalMonths(formData, "standardServiceIntervalMonths");
  const firstServiceIntervalMonths = parseOptionalMonths(formData, "firstServiceIntervalMonths");

  if (!modelName) throw new Error("Modellnamn krävs");

  const manufacturerId = await resolveManufacturerId(formData);
  await assertModelAvailable(manufacturerId, modelName);

  const categoryId = await resolveCategoryId(formData);

  const model = await prisma.$transaction(async (tx) => {
    const created = await tx.machineModel.create({
      data: {
        manufacturerId,
        modelName,
        categoryId,
        standardWarrantyMonths,
        standardServiceIntervalMonths,
        firstServiceIntervalMonths,
      },
    });
    await syncCampaignSheetLinks(tx, created.id, formData);
    return created;
  });

  revalidatePath("/machine-models");
  redirect(`/machine-models/${model.id}`);
}

export async function updateMachineModel(modelId: string, formData: FormData) {
  const standardWarrantyMonths = Number(formData.get("standardWarrantyMonths") ?? 24);
  const standardServiceIntervalMonths = parseOptionalMonths(formData, "standardServiceIntervalMonths");
  const firstServiceIntervalMonths = parseOptionalMonths(formData, "firstServiceIntervalMonths");
  const categoryId = await resolveCategoryId(formData);

  await prisma.$transaction(async (tx) => {
    await tx.machineModel.update({
      where: { id: modelId },
      data: { categoryId, standardWarrantyMonths, standardServiceIntervalMonths, firstServiceIntervalMonths },
    });
    await syncCampaignSheetLinks(tx, modelId, formData);
  });

  revalidatePath("/machine-models");
  revalidatePath(`/machine-models/${modelId}`);
  redirect(`/machine-models/${modelId}`);
}
