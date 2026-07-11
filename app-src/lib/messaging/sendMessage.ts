import { prisma } from "@/lib/db";
import { ElksProvider } from "@/lib/messaging/providers/elks";
import { MailercloudProvider } from "@/lib/messaging/providers/mailercloud";
import type { MessageProvider } from "@/lib/messaging/types";
import { getMessagingConfig } from "@/lib/messaging/config";
import { toE164Sweden } from "@/lib/phone";

function renderTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");
}

function getProvider(channel: string): { provider: MessageProvider; providerName: string } {
  if (channel === "sms") return { provider: new ElksProvider(), providerName: "46elks" };
  return { provider: new MailercloudProvider(), providerName: "mailercloud" };
}

export interface SendMessageInput {
  templateKey: string;
  customerId?: string;
  machineId?: string;
  orderId?: string;
  variables?: Record<string, string>;
  retryOfId?: string;
}

/**
 * Enda ingångspunkten för utskick. Garanterar två saker för ALLA anrop:
 * 1. Marknadsföringsutskick blockeras om kunden inte lämnat samtycke.
 * 2. Varje försök (lyckat, misslyckat eller blockerat) loggas i message_log —
 *    detta är GDPR-granskningsspåret ("vad skickades, till vem, när").
 */
export async function sendMessage(input: SendMessageInput) {
  const template = await prisma.messageTemplate.findUnique({ where: { key: input.templateKey } });
  if (!template || !template.isActive) {
    throw new Error(`Ingen aktiv mall med nyckel "${input.templateKey}"`);
  }

  const customer = input.customerId
    ? await prisma.customer.findUnique({ where: { id: input.customerId } })
    : null;

  const { companyName } = await getMessagingConfig();
  const variables = { shop_name: companyName || "Verkstaden", ...input.variables };
  const bodySent = renderTemplate(template.body, variables);
  const subject = template.subject ? renderTemplate(template.subject, variables) : null;

  const recipientAddress =
    template.channel === "sms" ? toE164Sweden(customer?.phone) : customer?.email ?? null;

  const baseLog = {
    customerId: input.customerId ?? null,
    machineId: input.machineId ?? null,
    orderId: input.orderId ?? null,
    templateKey: template.key,
    channel: template.channel,
    legalBasis: template.legalBasis,
    recipientAddress,
    subject,
    bodySent,
    provider: template.channel === "sms" ? "46elks" : "mailercloud",
    retryOfId: input.retryOfId ?? null,
  };

  if (template.legalBasis === "marketing" && !customer?.marketingConsent) {
    return prisma.messageLog.create({
      data: { ...baseLog, status: "blocked", errorMessage: "Kunden har inte lämnat samtycke" },
    });
  }

  if (!recipientAddress) {
    return prisma.messageLog.create({
      data: { ...baseLog, status: "blocked", errorMessage: "Ingen mottagaradress (telefon/e-post) registrerad" },
    });
  }

  const { provider } = getProvider(template.channel);
  try {
    const { providerMessageId } = await provider.send(recipientAddress, bodySent, subject ?? undefined);
    return prisma.messageLog.create({
      data: { ...baseLog, status: "sent", providerMessageId, sentAt: new Date() },
    });
  } catch (e) {
    return prisma.messageLog.create({
      data: { ...baseLog, status: "failed", errorMessage: (e as Error).message },
    });
  }
}
