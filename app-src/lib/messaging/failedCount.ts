import { prisma } from "@/lib/db";

export async function getUnresolvedFailedCount(): Promise<number> {
  return prisma.messageLog.count({ where: { status: "failed", retries: { none: {} } } });
}
