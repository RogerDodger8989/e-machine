"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function createMessageTemplate(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim();
  const channel = String(formData.get("channel") ?? "sms");
  const legalBasis = String(formData.get("legalBasis") ?? "service_reminder");
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();

  if (!key) throw new Error("Nyckel krävs");
  if (!body) throw new Error("Text krävs");

  await prisma.messageTemplate.create({ data: { key, channel, legalBasis, subject, body } });

  revalidatePath("/settings/templates");
  redirect("/settings/templates");
}

export async function updateMessageTemplate(templateId: string, formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!body) throw new Error("Text krävs");

  await prisma.messageTemplate.update({
    where: { id: templateId },
    data: { subject, body, isActive },
  });

  revalidatePath("/settings/templates");
  redirect("/settings/templates");
}
