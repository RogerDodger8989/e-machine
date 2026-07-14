"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/messaging/sendMessage";
import { resolveDueCycle } from "@/lib/jobs/serviceReminders";
import { resolveServiceIntervals } from "@/lib/serviceInterval";
import { addMonths } from "@/lib/date";

export type ReminderChannel = "sms" | "email";

const TEMPLATE_KEY_BY_CHANNEL: Record<ReminderChannel, string> = {
  sms: "service_reminder_sms",
  email: "service_reminder_email",
};

export interface SendServiceRemindersResult {
  sent: number;
  blocked: number;
  failed: number;
  alreadySent: number;
}

/**
 * Skickar servicepåminnelser för de valda maskinerna på de valda kanalerna.
 * Görs enbart efter manuell granskning (se app/messages/service) —
 * ingen automatisk körning finns längre. Idempotens-kollen här är ett
 * säkerhetsnät (t.ex. om någon skickar samma lista två gånger), inte den
 * primära spärren — det är den mänskliga granskningen.
 */
export async function sendServiceReminders(
  machineIds: string[],
  channels: ReminderChannel[]
): Promise<SendServiceRemindersResult> {
  const result: SendServiceRemindersResult = { sent: 0, blocked: 0, failed: 0, alreadySent: 0 };
  if (machineIds.length === 0 || channels.length === 0) return result;

  const machines = await prisma.machine.findMany({
    where: { id: { in: machineIds }, purchaseDate: { not: null } },
    include: {
      model: { include: { manufacturer: true, category: true } },
      ownerships: { where: { ownedUntil: null }, include: { customer: true } },
    },
  });

  const today = new Date();

  for (const machine of machines) {
    const ownership = machine.ownerships[0];
    if (!ownership || ownership.customer.isDeleted) continue;

    const { firstMonths, recurringMonths } = resolveServiceIntervals(machine.model, machine.model.category);
    const { nextDueDate, cycleLengthMonths } = await resolveDueCycle(
      machine.id,
      machine.purchaseDate!,
      firstMonths,
      recurringMonths,
      today
    );
    const cycleStart = addMonths(nextDueDate, -cycleLengthMonths);

    for (const channel of channels) {
      // "failed" spärrar inte en förnyad send-knapp-tryckning — bara lyckade
      // eller medvetet blockerade utskick räknas som redan hanterade.
      const alreadySent = await prisma.messageLog.findFirst({
        where: {
          machineId: machine.id,
          legalBasis: "service_reminder",
          channel,
          status: { in: ["sent", "blocked"] },
          createdAt: { gt: cycleStart },
        },
      });
      if (alreadySent) {
        result.alreadySent++;
        continue;
      }

      const log = await sendMessage({
        templateKey: TEMPLATE_KEY_BY_CHANNEL[channel],
        customerId: ownership.customerId,
        machineId: machine.id,
        variables: {
          customer_name: ownership.customer.name,
          model_name: `${machine.model.manufacturer.name} ${machine.model.modelName}`,
          serial_number: machine.serialNumber,
        },
      });

      if (log.status === "sent") result.sent++;
      else if (log.status === "blocked") result.blocked++;
      else result.failed++;
    }
  }

  revalidatePath("/messages/service");
  revalidatePath("/customers");
  return result;
}
