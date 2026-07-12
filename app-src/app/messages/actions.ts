"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { attemptResend, type ResendOutcome } from "@/lib/messaging/resend";

export async function resendMessage(logId: string): Promise<ResendOutcome> {
  const outcome = await attemptResend(logId);

  const log = await prisma.messageLog.findUnique({ where: { id: logId }, select: { customerId: true } });
  revalidatePath("/messages");
  if (log?.customerId) revalidatePath(`/customers/${log.customerId}`);

  return outcome;
}

export interface ResendAllFailedResult {
  attempted: number;
  sent: number;
  blocked: number;
  failed: number;
  skipped: number;
}

export async function resendAllFailed(): Promise<ResendAllFailedResult> {
  const unresolved = await prisma.messageLog.findMany({
    where: { status: "failed", retries: { none: {} } },
    select: { id: true },
  });

  const result: ResendAllFailedResult = { attempted: 0, sent: 0, blocked: 0, failed: 0, skipped: 0 };

  for (const { id } of unresolved) {
    result.attempted++;
    const outcome = await attemptResend(id);
    if (!outcome.ok) {
      result.skipped++;
      continue;
    }
    if (outcome.status === "sent") result.sent++;
    else if (outcome.status === "blocked") result.blocked++;
    else result.failed++;
  }

  revalidatePath("/messages");
  revalidatePath("/customers");
  return result;
}

/**
 * Tar bort en enskild loggrad (t.ex. skräp från ett upprepat fel). Om en
 * senare rad pekar på den här via retryOfId (den har skickats om) nollas
 * den kopplingen först, annars slår foreign key-constrainten till.
 */
export async function deleteMessageLog(logId: string) {
  const log = await prisma.messageLog.findUnique({ where: { id: logId }, select: { customerId: true } });
  if (!log) return; // redan borttagen (t.ex. dubbelklick) — inget att göra

  await prisma.messageLog.updateMany({ where: { retryOfId: logId }, data: { retryOfId: null } });
  await prisma.messageLog.delete({ where: { id: logId } });

  revalidatePath("/messages");
  revalidatePath("/sms");
  if (log.customerId) revalidatePath(`/customers/${log.customerId}`);
}
