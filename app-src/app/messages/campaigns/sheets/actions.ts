"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function createCampaignSheetTemplate(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();

  if (!key) throw new Error("Namn krävs");
  if (!body) throw new Error("Text krävs");

  await prisma.messageTemplate.create({
    data: { key, channel: "email", legalBasis: "campaign_sheet", subject, body },
  });

  revalidatePath("/messages/campaigns/sheets");
  redirect("/messages/campaigns/sheets");
}

export async function updateCampaignSheetTemplate(templateId: string, formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!body) throw new Error("Text krävs");

  await prisma.messageTemplate.update({
    where: { id: templateId },
    data: { subject, body, isActive },
  });

  revalidatePath("/messages/campaigns/sheets");
  redirect("/messages/campaigns/sheets");
}
