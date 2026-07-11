"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveCategoryId } from "@/lib/categories";

// SQLite stödjer inte case-insensitive matchning direkt — jämför i JS,
// samma mönster som app/settings/categories/actions.ts.
async function assertModelAvailable(manufacturer: string, modelName: string) {
  const existing = await prisma.machineModel.findMany({ where: { manufacturer }, select: { modelName: true } });
  const clash = existing.find((m) => m.modelName.toLowerCase() === modelName.toLowerCase());
  if (clash) throw new Error(`Modellen "${modelName}" finns redan för ${manufacturer}`);
}

export async function createMachineModel(formData: FormData) {
  const manufacturer = String(formData.get("manufacturer") ?? "");
  const modelName = String(formData.get("modelName") ?? "").trim();
  const standardWarrantyMonths = Number(formData.get("standardWarrantyMonths") ?? 24);
  const standardServiceIntervalMonths = Number(formData.get("standardServiceIntervalMonths") ?? 12);

  if (!modelName) throw new Error("Modellnamn krävs");
  if (manufacturer !== "Stiga" && manufacturer !== "Stihl") {
    throw new Error("Tillverkare måste vara Stiga eller Stihl");
  }
  await assertModelAvailable(manufacturer, modelName);

  const categoryId = await resolveCategoryId(formData);

  const model = await prisma.machineModel.create({
    data: {
      manufacturer,
      modelName,
      categoryId,
      standardWarrantyMonths,
      standardServiceIntervalMonths,
    },
  });

  revalidatePath("/machine-models");
  redirect(`/machine-models/${model.id}`);
}

export async function updateMachineModel(modelId: string, formData: FormData) {
  const standardWarrantyMonths = Number(formData.get("standardWarrantyMonths") ?? 24);
  const standardServiceIntervalMonths = Number(formData.get("standardServiceIntervalMonths") ?? 12);
  const categoryId = await resolveCategoryId(formData);

  await prisma.machineModel.update({
    where: { id: modelId },
    data: { categoryId, standardWarrantyMonths, standardServiceIntervalMonths },
  });

  revalidatePath("/machine-models");
  revalidatePath(`/machine-models/${modelId}`);
  redirect(`/machine-models/${modelId}`);
}
