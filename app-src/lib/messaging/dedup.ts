import { prisma } from "@/lib/db";

const DUPLICATE_WINDOW_MINUTES = 10;

/**
 * Skydd mot dubbelsändning vid manuella bulk-utskick: om samma mall redan
 * skickats till samma kund de senaste minuterna (t.ex. ett klick till efter
 * en osäker första gång, eller två flikar/enheter öppna samtidigt) ska den
 * kombinationen hoppas över istället för att skicka igen.
 */
export async function wasRecentlySent(customerId: string, templateKey: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000);
  const recentSend = await prisma.messageLog.findFirst({
    where: {
      customerId,
      templateKey,
      status: { in: ["sent", "blocked"] },
      createdAt: { gt: windowStart },
    },
  });
  return !!recentSend;
}
