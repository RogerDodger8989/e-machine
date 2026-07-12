import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/messaging/sendMessage";

export type ResendOutcome =
  | { ok: true; status: "sent" | "failed" | "blocked" }
  | { ok: false; reason: string };

/**
 * Delad logik för att skicka om en misslyckad loggrad. Bygger färska
 * variabler från den levande kunden/maskinen (inte de sparade snapshotarna
 * i loggraden) så t.ex. ett rättat telefonnummer eller återkallat samtycke
 * respekteras vid omskicket. Skapar en helt ny loggrad via sendMessage(),
 * originalraden lämnas orörd som historik.
 */
export async function attemptResend(logId: string): Promise<ResendOutcome> {
  const log = await prisma.messageLog.findUnique({
    where: { id: logId },
    include: {
      customer: true,
      machine: {
        include: {
          model: true,
          ownerships: { where: { ownedUntil: null }, include: { customer: true } },
        },
      },
    },
  });

  if (!log) return { ok: false, reason: "Loggraden hittades inte." };
  if (!log.templateKey) return { ok: false, reason: "Ingen mall kopplad till loggraden." };

  const template = await prisma.messageTemplate.findUnique({ where: { key: log.templateKey } });
  if (!template || !template.isActive) {
    return { ok: false, reason: `Mallen "${log.templateKey}" är inaktiverad eller borttagen — kan inte skickas om.` };
  }

  if (!log.customerId || !log.customer) {
    return { ok: false, reason: "Kunden är okänd, kan inte skickas om." };
  }
  if (log.customer.isDeleted) {
    return { ok: false, reason: "Kunden är raderad/anonymiserad, kan inte skickas om." };
  }
  const requiresMachine = log.legalBasis === "service_reminder" || log.legalBasis === "campaign_sheet";
  if (requiresMachine && (!log.machineId || !log.machine)) {
    return { ok: false, reason: "Maskinen är inte längre kopplad till loggen, kan inte skickas om." };
  }

  let variables: Record<string, string>;
  if (requiresMachine && log.machine) {
    variables = {
      customer_name: log.customer.name,
      model_name: `${log.machine.model.manufacturer} ${log.machine.model.modelName}`,
      serial_number: log.machine.serialNumber,
    };
  } else {
    variables = { customer_name: log.customer.name };
  }

  try {
    const newLog = await sendMessage({
      templateKey: log.templateKey,
      customerId: log.customerId,
      machineId: log.machineId ?? undefined,
      variables,
      retryOfId: log.id,
    });
    return { ok: true, status: newLog.status as "sent" | "failed" | "blocked" };
  } catch (e) {
    // sendMessage() kan i undantagsfall kasta (t.ex. om mallen togs bort
    // mellan kollen ovan och detta anrop) — fångas här så ett omförsök
    // aldrig kraschar sidan, bara visas som ett misslyckat omskick.
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Snabb, synkron variant av samma guards som attemptResend() kollar server-
 * side, för att avgöra om omskicksknappen ska visas som klickbar i UI:t.
 * Den djupare ägarskaps-kollen (är maskinen fortfarande kopplad till just
 * DEN HÄR kunden) görs bara vid faktiskt klick, inte här.
 */
export function getResendEligibility(
  log: { status: string; customerId: string | null; legalBasis: string; machineId: string | null },
  customerIsDeleted: boolean
): { canResend: boolean; reason?: string } {
  if (log.status !== "failed") return { canResend: false };
  if (!log.customerId) return { canResend: false, reason: "Kunden är okänd." };
  if (customerIsDeleted) return { canResend: false, reason: "Kunden är raderad/anonymiserad." };
  if ((log.legalBasis === "service_reminder" || log.legalBasis === "campaign_sheet") && !log.machineId) {
    return { canResend: false, reason: "Maskinen är inte längre kopplad till loggen." };
  }
  return { canResend: true };
}
