"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const postalCode = String(formData.get("postalCode") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Namn krävs");

  const customer = await prisma.customer.create({
    data: {
      name,
      company,
      phone,
      phoneNormalized: normalizePhone(phone),
      email,
      address,
      postalCode,
      city,
      marketingConsent,
      marketingConsentAt: marketingConsent ? new Date() : null,
      notes,
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const postalCode = String(formData.get("postalCode") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Namn krävs");

  const existing = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      company,
      phone,
      phoneNormalized: normalizePhone(phone),
      email,
      address,
      postalCode,
      city,
      marketingConsent,
      // sätt bara ny samtyckestidsstämpel om samtycket faktiskt slås på nu
      marketingConsentAt:
        marketingConsent && !existing.marketingConsent ? new Date() : existing.marketingConsentAt,
      notes,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function updateCustomerNotes(customerId: string, notes: string) {
  await prisma.customer.update({
    where: { id: customerId },
    data: { notes: notes.trim() || null },
  });

  revalidatePath(`/customers/${customerId}`);
}

/**
 * GDPR "rätten att bli glömd": anonymiserar kundens personuppgifter men behåller
 * raden (och därmed maskinernas ägandehistorik / utskicksloggen) orörd i övrigt.
 */
export async function anonymizeCustomer(customerId: string) {
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: "Raderad kund",
      company: null,
      phone: null,
      phoneNormalized: null,
      email: null,
      address: null,
      postalCode: null,
      city: null,
      marketingConsent: false,
      marketingConsentAt: null,
      notes: null,
      isDeleted: true,
      anonymizedAt: new Date(),
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}
