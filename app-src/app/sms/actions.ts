"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { sendDirectSms } from "@/lib/messaging/sendDirectSms";

export async function sendSms(formData: FormData) {
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const articleDescription = String(formData.get("articleDescription") ?? "").trim();
  const amountDueRaw = String(formData.get("amountDue") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const templateKey = String(formData.get("templateKey") ?? "").trim() || undefined;

  if (!phoneNumber) throw new Error("Telefonnummer krävs");
  if (!articleDescription) throw new Error("Vara/artikel krävs");
  if (!message) throw new Error("Meddelande krävs");

  const amountDue = amountDueRaw ? Number(amountDueRaw) : null;

  const order = await prisma.order.create({
    data: { phoneNumber, articleDescription, amountDue },
  });

  await sendDirectSms({ to: phoneNumber, body: message, orderId: order.id, templateKey });

  revalidatePath("/sms");
}

/**
 * Skickar en påminnelse — skickar om exakt samma text som ursprungligen
 * gick ut för den här beställningen.
 */
export async function sendOrderReminder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { messageLogs: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  // Om den ursprungliga loggraden har tagits bort (t.ex. via /messages) finns
  // ingen text att skicka om — måste stoppas här, annars skulle vi av misstag
  // kunna skicka "vara/artikel"-fältet som SMS-text till en riktig kund.
  const original = order.messageLogs[0];
  if (!original) {
    throw new Error("Inget tidigare meddelande att skicka om — den ursprungliga loggraden är borttagen.");
  }

  await sendDirectSms({
    to: order.phoneNumber,
    body: original.bodySent,
    orderId: order.id,
    templateKey: "order_paminnelse",
  });

  revalidatePath("/sms");
}

/**
 * Tar bort en beställning helt, inklusive dess skickförsök ur
 * utskicksloggen — inget att spara som logg när inget meddelande faktiskt
 * gick fram. message_log har en foreign key mot orders, så loggraderna
 * måste tas bort innan beställningsraden själv kan raderas.
 */
export async function deleteOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
  if (!order) return; // redan borttagen (t.ex. dubbelklick) — inget att göra

  await prisma.messageLog.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/sms");
  revalidatePath("/messages");
  revalidatePath("/statistik");
}
