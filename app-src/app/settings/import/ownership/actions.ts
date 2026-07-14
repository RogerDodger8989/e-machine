"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { matchCustomer } from "@/lib/import/matchCustomer";
import { applyMapping, type ColumnMapping } from "@/lib/import/mapping";
import { normalizeManufacturer } from "@/lib/import/manufacturer";
import { findOrCreateMachineModel, findMachineBySerialNumber } from "@/lib/machineMatching";
import type { PreviewRow } from "@/components/import/import-preview-table";

type OwnershipAction = "create-machine" | "relink" | "confirm" | "skip";

interface OwnershipPlanRow extends PreviewRow {
  action: OwnershipAction;
  serialNumber: string;
  customerId: string | null;
  manufacturer: string | null;
  modelName: string | null;
}

/**
 * Bygger importplanen rad för rad — delas av förhandsgranskning och
 * bekräftelse, precis som kundimporten (app/settings/import/customers/actions.ts).
 */
async function planOwnershipImport(rows: Record<string, string>[], mapping: ColumnMapping): Promise<OwnershipPlanRow[]> {
  const plans: OwnershipPlanRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2;

    const serialNumber = applyMapping(row, mapping, "serialNumber");
    const customerExternalId = applyMapping(row, mapping, "customerExternalId") || undefined;
    const customerPhone = applyMapping(row, mapping, "customerPhone") || undefined;
    const customerEmail = applyMapping(row, mapping, "customerEmail") || undefined;
    const manufacturerRaw = applyMapping(row, mapping, "manufacturer");
    const modelName = applyMapping(row, mapping, "modelName") || null;
    const manufacturer = manufacturerRaw ? normalizeManufacturer(manufacturerRaw) : null;

    const summary = [serialNumber, manufacturerRaw, modelName].filter(Boolean).join(" · ") || `Rad ${rowIndex}`;

    if (!serialNumber) {
      plans.push({ rowIndex, status: "skip", message: "Serienummer saknas", summary, action: "skip", serialNumber, customerId: null, manufacturer, modelName });
      continue;
    }

    if (!customerExternalId && !customerPhone && !customerEmail) {
      plans.push({ rowIndex, status: "skip", message: "Ingen kundinformation angiven på raden", summary, action: "skip", serialNumber, customerId: null, manufacturer, modelName });
      continue;
    }

    const match = await matchCustomer({ externalId: customerExternalId, phone: customerPhone, email: customerEmail });
    if (match.status === "new" || match.status === "ambiguous") {
      plans.push({
        rowIndex,
        status: "skip",
        message: match.status === "ambiguous" ? "Kunden matchar flera befintliga poster" : "Kund saknas — importera kunder från Crona först",
        summary,
        action: "skip",
        serialNumber,
        customerId: null,
        manufacturer,
        modelName,
      });
      continue;
    }

    const customerId = match.customerId!;
    const existingMachine = await findMachineBySerialNumber(serialNumber);

    if (!existingMachine) {
      if (!manufacturer || !modelName) {
        plans.push({
          rowIndex,
          status: "skip",
          message: "Maskinen finns inte och saknar modellinformation — kan inte skapas",
          summary,
          action: "skip",
          serialNumber,
          customerId,
          manufacturer,
          modelName,
        });
        continue;
      }
      plans.push({ rowIndex, status: "new", message: "Ny maskin, kopplas till kund", summary, action: "create-machine", serialNumber, customerId, manufacturer, modelName });
      continue;
    }

    const activeOwnership = await prisma.machineOwnership.findFirst({
      where: { machineId: existingMachine.id, ownedUntil: null },
      include: { customer: { select: { name: true } } },
    });

    if (activeOwnership && activeOwnership.customerId === customerId) {
      plans.push({ rowIndex, status: "update", message: "Redan kopplad till rätt kund", summary, action: "confirm", serialNumber, customerId, manufacturer, modelName });
    } else if (activeOwnership) {
      plans.push({
        rowIndex,
        status: "warning",
        message: `Ägarbyte: "${activeOwnership.customer.name}" → ny ägare`,
        summary,
        action: "relink",
        serialNumber,
        customerId,
        manufacturer,
        modelName,
      });
    } else {
      plans.push({
        rowIndex,
        status: "warning",
        message: "Maskinen saknar aktiv ägare — kopplas till denna kund",
        summary,
        action: "relink",
        serialNumber,
        customerId,
        manufacturer,
        modelName,
      });
    }
  }

  return plans;
}

export async function previewOwnershipImport(rows: Record<string, string>[], mapping: ColumnMapping): Promise<PreviewRow[]> {
  return planOwnershipImport(rows, mapping);
}

export interface CommitOwnershipImportResult {
  createdMachines: number;
  changed: number;
  unchanged: number;
  skipped: number;
  total: number;
}

export async function commitOwnershipImport(rows: Record<string, string>[], mapping: ColumnMapping): Promise<CommitOwnershipImportResult> {
  const plans = await planOwnershipImport(rows, mapping);
  let createdMachines = 0;
  let changed = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const plan of plans) {
    if (plan.action === "skip") {
      skipped++;
      continue;
    }

    if (plan.action === "confirm") {
      unchanged++;
      continue;
    }

    if (plan.action === "create-machine") {
      const modelId = await findOrCreateMachineModel(plan.manufacturer!, plan.modelName!);
      await prisma.machine.create({
        data: {
          modelId,
          serialNumber: plan.serialNumber,
          ownerships: { create: { customerId: plan.customerId! } },
        },
      });
      createdMachines++;
      changed++;
      continue;
    }

    if (plan.action === "relink") {
      const machine = await findMachineBySerialNumber(plan.serialNumber);
      if (!machine) {
        skipped++;
        continue;
      }
      await prisma.machineOwnership.updateMany({
        where: { machineId: machine.id, ownedUntil: null },
        data: { ownedUntil: new Date(), unlinkReason: "other" },
      });
      await prisma.machineOwnership.create({
        data: { machineId: machine.id, customerId: plan.customerId! },
      });
      changed++;
      continue;
    }
  }

  revalidatePath("/customers");
  revalidatePath("/machines");
  return { createdMachines, changed, unchanged, skipped, total: plans.length };
}
