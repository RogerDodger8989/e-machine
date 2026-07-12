"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/messaging/sendMessage";
import { wasRecentlySent } from "@/lib/messaging/dedup";

export interface SendCampaignResult {
  sent: number;
  blocked: number;
  failed: number;
  skipped: number;
}

/**
 * Skickar en manuell kampanj (marknadsföring) till valda kunder på valda
 * mallar. Till skillnad från servicepåminnelser är det HÄR kundens uttryckliga
 * val av kunder och mall(ar) — inget "aktuellt datum"-filter. sendMessage()
 * spärrar ändå automatiskt kunder utan samtycke, som ett sista skyddsnät.
 *
 * Skydd mot dubbelsändning: om samma mall redan skickats till samma kund de
 * senaste minuterna (t.ex. ett klick till efter en osäker första gång, eller
 * två flikar/enheter öppna samtidigt) hoppas den kunden/mallen över istället
 * för att skicka igen.
 */
export async function sendCampaign(
  customerIds: string[],
  templateKeys: string[]
): Promise<SendCampaignResult> {
  const result: SendCampaignResult = { sent: 0, blocked: 0, failed: 0, skipped: 0 };
  if (customerIds.length === 0 || templateKeys.length === 0) return result;

  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds }, isDeleted: false },
  });

  for (const customer of customers) {
    for (const templateKey of templateKeys) {
      if (await wasRecentlySent(customer.id, templateKey)) {
        result.skipped++;
        continue;
      }

      const log = await sendMessage({
        templateKey,
        customerId: customer.id,
        variables: {
          customer_name: customer.name,
        },
      });

      if (log.status === "sent") result.sent++;
      else if (log.status === "blocked") result.blocked++;
      else result.failed++;
    }
  }

  revalidatePath("/customers");
  return result;
}
