"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/messaging/sendMessage";
import { wasRecentlySent } from "@/lib/messaging/dedup";

export interface SendCampaignSheetBulkResult {
  sent: number;
  blocked: number;
  failed: number;
  skipped: number;
}

/**
 * Mailar ett valt kampanjblad till flera maskiners ägare på en gång.
 * Samma skydd som sendCampaign(): sendMessage() spärrar kunder utan
 * samtycke, och wasRecentlySent() hoppar över redan-skickade de senaste
 * 10 minuterna (delad logik, se lib/messaging/dedup.ts).
 */
export async function sendCampaignSheetBulk(
  machineIds: string[],
  templateKey: string
): Promise<SendCampaignSheetBulkResult> {
  const result: SendCampaignSheetBulkResult = { sent: 0, blocked: 0, failed: 0, skipped: 0 };
  if (machineIds.length === 0 || !templateKey) return result;

  const machines = await prisma.machine.findMany({
    where: { id: { in: machineIds } },
    include: {
      model: { include: { manufacturer: true } },
      ownerships: { where: { ownedUntil: null }, include: { customer: true } },
    },
  });

  for (const machine of machines) {
    const owner = machine.ownerships[0]?.customer;
    if (!owner || owner.isDeleted) {
      result.skipped++;
      continue;
    }

    if (await wasRecentlySent(owner.id, templateKey)) {
      result.skipped++;
      continue;
    }

    const log = await sendMessage({
      templateKey,
      customerId: owner.id,
      machineId: machine.id,
      variables: {
        customer_name: owner.name,
        model_name: `${machine.model.manufacturer.name} ${machine.model.modelName}`,
        serial_number: machine.serialNumber,
      },
    });

    if (log.status === "sent") result.sent++;
    else if (log.status === "blocked") result.blocked++;
    else result.failed++;
  }

  revalidatePath("/customers");
  revalidatePath("/machines");
  return result;
}
