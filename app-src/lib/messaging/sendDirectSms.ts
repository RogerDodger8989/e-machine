import { prisma } from "@/lib/db";
import { ElksProvider } from "@/lib/messaging/providers/elks";
import { toE164Sweden } from "@/lib/phone";

export interface SendDirectSmsInput {
  to: string;
  body: string;
  orderId?: string;
  templateKey?: string;
  retryOfId?: string;
}

/**
 * Skickar SMS direkt till ett inskrivet telefonnummer, utan koppling till en
 * registrerad kund och utan mallrendering (Sms-fliken har fritt redigerbara
 * meddelanden, inte {{variabel}}-mallar) — motsvarande hur SendSms fungerade.
 * Loggar alltid till samma message_log-tabell som resten av appens utskick,
 * så det syns i /messages och i statistiken precis som allt annat.
 */
export async function sendDirectSms(input: SendDirectSmsInput) {
  const recipientAddress = toE164Sweden(input.to);

  const baseLog = {
    orderId: input.orderId ?? null,
    templateKey: input.templateKey ?? null,
    channel: "sms",
    legalBasis: "order_ready",
    recipientAddress,
    bodySent: input.body,
    provider: "46elks",
    retryOfId: input.retryOfId ?? null,
  };

  if (!recipientAddress) {
    return prisma.messageLog.create({
      data: { ...baseLog, status: "blocked", errorMessage: "Ogiltigt telefonnummer" },
    });
  }

  try {
    const { providerMessageId } = await new ElksProvider().send(recipientAddress, input.body);
    return prisma.messageLog.create({
      data: { ...baseLog, status: "sent", providerMessageId, sentAt: new Date() },
    });
  } catch (e) {
    return prisma.messageLog.create({
      data: { ...baseLog, status: "failed", errorMessage: (e as Error).message },
    });
  }
}
