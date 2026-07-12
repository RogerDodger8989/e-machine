"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { matchCustomer } from "@/lib/import/matchCustomer";
import { applyMapping, type ColumnMapping } from "@/lib/import/mapping";
import { parseImportDate } from "@/lib/import/parseDate";
import { findOrCreateMachineModel, findMachineBySerialNumber } from "@/lib/machineMatching";
import type { PreviewRow } from "@/components/import/import-preview-table";

type Manufacturer = "Stiga" | "Stihl";
type WarrantyAction = "create-machine" | "update-machine" | "skip";

interface NewCustomerData {
  name: string;
  phone: string | null;
  email: string | null;
}

interface WarrantyPlanRow extends PreviewRow {
  action: WarrantyAction;
  serialNumber: string;
  modelName: string;
  purchaseDate: Date | null;
  warrantyEndDate: Date | null;
  matchedCustomerId: string | null;
  newCustomer: NewCustomerData | null;
}

/**
 * Bygger importplanen rad för rad — delas av förhandsgranskning och
 * bekräftelse. Till skillnad från maskinägande-importen (steg 4) skapas här
 * en ny kund om ingen matchar, eftersom garantiraden är maskinens enda
 * ägaruppgift och schemat kräver en ägande kund för att spara maskinen alls.
 */
async function planWarrantyImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  manufacturer: Manufacturer
): Promise<WarrantyPlanRow[]> {
  const plans: WarrantyPlanRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2;

    const serialNumber = applyMapping(row, mapping, "serialNumber");
    const modelName = applyMapping(row, mapping, "modelName");
    const purchaseDate = parseImportDate(applyMapping(row, mapping, "purchaseDate"));
    const warrantyEndDate = parseImportDate(applyMapping(row, mapping, "warrantyEndDate"));
    const customerName = applyMapping(row, mapping, "customerName");
    const customerPhone = applyMapping(row, mapping, "customerPhone") || undefined;
    const customerEmail = applyMapping(row, mapping, "customerEmail") || undefined;

    const summary = [serialNumber, modelName, customerName].filter(Boolean).join(" · ") || `Rad ${rowIndex}`;

    if (!serialNumber || !modelName) {
      plans.push({
        rowIndex, status: "skip", message: "Serienummer och modellnamn krävs", summary, action: "skip",
        serialNumber, modelName, purchaseDate, warrantyEndDate, matchedCustomerId: null, newCustomer: null,
      });
      continue;
    }

    if (!customerName && !customerPhone && !customerEmail) {
      plans.push({
        rowIndex, status: "skip", message: "Ingen kundinformation — maskinen kräver en ägare", summary, action: "skip",
        serialNumber, modelName, purchaseDate, warrantyEndDate, matchedCustomerId: null, newCustomer: null,
      });
      continue;
    }

    const match = await matchCustomer({ phone: customerPhone, email: customerEmail });
    if (match.status === "ambiguous") {
      plans.push({
        rowIndex, status: "skip", message: "Kunden matchar flera befintliga poster", summary, action: "skip",
        serialNumber, modelName, purchaseDate, warrantyEndDate, matchedCustomerId: null, newCustomer: null,
      });
      continue;
    }

    const matchedCustomerId = match.status === "new" ? null : match.customerId;
    const newCustomer: NewCustomerData | null =
      match.status === "new"
        ? { name: customerName || customerPhone || customerEmail || "", phone: customerPhone ?? null, email: customerEmail ?? null }
        : null;

    const existingMachine = await findMachineBySerialNumber(serialNumber);
    let ownershipNote = "";
    if (existingMachine) {
      const activeOwnership = await prisma.machineOwnership.findFirst({
        where: { machineId: existingMachine.id, ownedUntil: null },
      });
      if (activeOwnership && (newCustomer || activeOwnership.customerId !== matchedCustomerId)) {
        ownershipNote = " (Ägarbyte)";
      }
    }

    const action: WarrantyAction = existingMachine ? "update-machine" : "create-machine";
    const isWarning = !!newCustomer || !!ownershipNote;
    const baseMessage = existingMachine ? "Befintlig maskin uppdateras" : "Ny maskin skapas";
    const customerMessage = newCustomer ? ", ny kund skapas" : "";

    plans.push({
      rowIndex,
      status: isWarning ? "warning" : existingMachine ? "update" : "new",
      message: `${baseMessage}${customerMessage}${ownershipNote}`,
      summary,
      action,
      serialNumber,
      modelName,
      purchaseDate,
      warrantyEndDate,
      matchedCustomerId,
      newCustomer,
    });
  }

  return plans;
}

export async function previewWarrantyImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  manufacturer: Manufacturer
): Promise<PreviewRow[]> {
  return planWarrantyImport(rows, mapping, manufacturer);
}

export interface CommitWarrantyImportResult {
  machinesCreated: number;
  machinesUpdated: number;
  customersCreated: number;
  skipped: number;
  total: number;
}

export async function commitWarrantyImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  manufacturer: Manufacturer
): Promise<CommitWarrantyImportResult> {
  const plans = await planWarrantyImport(rows, mapping, manufacturer);
  let machinesCreated = 0;
  let machinesUpdated = 0;
  let customersCreated = 0;
  let skipped = 0;

  for (const plan of plans) {
    if (plan.action === "skip") {
      skipped++;
      continue;
    }

    let customerId = plan.matchedCustomerId;
    if (!customerId && plan.newCustomer) {
      const created = await prisma.customer.create({
        data: {
          name: plan.newCustomer.name,
          phone: plan.newCustomer.phone,
          phoneNormalized: normalizePhone(plan.newCustomer.phone),
          email: plan.newCustomer.email,
        },
      });
      customerId = created.id;
      customersCreated++;
    }
    if (!customerId) {
      skipped++;
      continue;
    }

    if (plan.action === "create-machine") {
      const modelId = await findOrCreateMachineModel(manufacturer, plan.modelName);
      await prisma.machine.create({
        data: {
          modelId,
          serialNumber: plan.serialNumber,
          purchaseDate: plan.purchaseDate,
          warrantyEndDate: plan.warrantyEndDate,
          ownerships: { create: { customerId } },
        },
      });
      machinesCreated++;
      continue;
    }

    // update-machine
    const machine = await findMachineBySerialNumber(plan.serialNumber);
    if (!machine) {
      skipped++;
      continue;
    }
    await prisma.machine.update({
      where: { id: machine.id },
      data: {
        ...(plan.purchaseDate ? { purchaseDate: plan.purchaseDate } : {}),
        ...(plan.warrantyEndDate ? { warrantyEndDate: plan.warrantyEndDate } : {}),
      },
    });
    const activeOwnership = await prisma.machineOwnership.findFirst({
      where: { machineId: machine.id, ownedUntil: null },
    });
    if (!activeOwnership || activeOwnership.customerId !== customerId) {
      if (activeOwnership) {
        await prisma.machineOwnership.updateMany({
          where: { machineId: machine.id, ownedUntil: null },
          data: { ownedUntil: new Date(), unlinkReason: "other" },
        });
      }
      await prisma.machineOwnership.create({ data: { machineId: machine.id, customerId } });
    }
    machinesUpdated++;
  }

  revalidatePath("/customers");
  revalidatePath("/machines");
  return { machinesCreated, machinesUpdated, customersCreated, skipped, total: plans.length };
}
