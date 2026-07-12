"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { matchCustomer } from "@/lib/import/matchCustomer";
import { applyMapping, type ColumnMapping } from "@/lib/import/mapping";
import type { PreviewRow } from "@/components/import/import-preview-table";

interface CustomerRowData {
  externalCronaId: string | null;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
}

interface CustomerPlanRow extends PreviewRow {
  data: CustomerRowData;
  matchedCustomerId: string | null;
}

/**
 * Bygger importplanen rad för rad — används av BÅDE förhandsgranskningen
 * och den faktiska importen, så en dry run aldrig kan visa andra siffror än
 * det som faktiskt sparas.
 */
async function planCustomerImport(rows: Record<string, string>[], mapping: ColumnMapping): Promise<CustomerPlanRow[]> {
  const plans: CustomerPlanRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // rad 1 är rubriker i källfilen

    const externalId = applyMapping(row, mapping, "externalId") || null;
    const name = applyMapping(row, mapping, "name");
    const company = applyMapping(row, mapping, "company") || null;
    const phone = applyMapping(row, mapping, "phone") || null;
    const email = applyMapping(row, mapping, "email") || null;
    const address = applyMapping(row, mapping, "address") || null;
    const postalCode = applyMapping(row, mapping, "postalCode") || null;
    const city = applyMapping(row, mapping, "city") || null;

    const data: CustomerRowData = { externalCronaId: externalId, name, company, phone, email, address, postalCode, city };
    const summary = [name, company, phone].filter(Boolean).join(" · ") || `Rad ${rowIndex}`;

    if (!name) {
      plans.push({ rowIndex, status: "skip", message: "Namn saknas", summary, data, matchedCustomerId: null });
      continue;
    }

    const match = await matchCustomer({ externalId: externalId ?? undefined, phone: phone ?? undefined, email: email ?? undefined });

    if (match.status === "ambiguous") {
      plans.push({
        rowIndex,
        status: "skip",
        message: "Matchar flera befintliga kunder — kunde inte avgöra vilken",
        summary,
        data,
        matchedCustomerId: null,
      });
    } else if (match.status === "new") {
      plans.push({ rowIndex, status: "new", message: "Ny kund", summary, data, matchedCustomerId: null });
    } else {
      const via = match.status === "matched-id" ? "kundnummer" : match.status === "matched-phone" ? "telefon" : "e-post";
      plans.push({ rowIndex, status: "update", message: `Matchad via ${via}`, summary, data, matchedCustomerId: match.customerId });
    }
  }

  return plans;
}

export async function previewCustomerImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): Promise<PreviewRow[]> {
  return planCustomerImport(rows, mapping);
}

export interface CommitCustomerImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

export async function commitCustomerImport(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): Promise<CommitCustomerImportResult> {
  const plans = await planCustomerImport(rows, mapping);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const plan of plans) {
    if (plan.status === "skip") {
      skipped++;
      continue;
    }

    const phoneNormalized = normalizePhone(plan.data.phone);

    if (plan.status === "new") {
      await prisma.customer.create({
        data: {
          externalCronaId: plan.data.externalCronaId,
          name: plan.data.name,
          company: plan.data.company,
          phone: plan.data.phone,
          phoneNormalized,
          email: plan.data.email,
          address: plan.data.address,
          postalCode: plan.data.postalCode,
          city: plan.data.city,
        },
      });
      created++;
    } else if (plan.status === "update" && plan.matchedCustomerId) {
      await prisma.customer.update({
        where: { id: plan.matchedCustomerId },
        data: {
          // Sätt bara externalCronaId om raden faktiskt hade ett — annars
          // skulle en återimport utan ID-kolumn nolla en tidigare satt koppling.
          ...(plan.data.externalCronaId ? { externalCronaId: plan.data.externalCronaId } : {}),
          name: plan.data.name,
          company: plan.data.company,
          phone: plan.data.phone,
          phoneNormalized,
          email: plan.data.email,
          address: plan.data.address,
          postalCode: plan.data.postalCode,
          city: plan.data.city,
        },
      });
      updated++;
    }
  }

  revalidatePath("/customers");
  return { created, updated, skipped, total: plans.length };
}
