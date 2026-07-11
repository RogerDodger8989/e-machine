import { prisma } from "@/lib/db";

export interface MessageMonthlyCount {
  yearMonth: string; // "2026-01"
  status: string;
  count: number;
}

export interface MessageStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byChannelStatus: { channel: string; status: string; count: number }[];
  byLegalBasisStatus: { legalBasis: string; status: string; count: number }[];
  monthly: MessageMonthlyCount[];
  statuses: string[];
}

export async function getMessageStats(from: Date, to: Date): Promise<MessageStats> {
  const where = { createdAt: { gte: from, lte: to } };

  const [byStatus, byChannelStatus, byLegalBasisStatus, rows] = await Promise.all([
    prisma.messageLog.groupBy({ by: ["status"], where, _count: true }),
    prisma.messageLog.groupBy({ by: ["channel", "status"], where, _count: true }),
    prisma.messageLog.groupBy({ by: ["legalBasis", "status"], where, _count: true }),
    prisma.messageLog.findMany({ where, select: { status: true, createdAt: true } }),
  ]);

  const monthlyMap = new Map<string, number>();
  const statusesSet = new Set<string>();
  for (const row of rows) {
    const yearMonth = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, "0")}`;
    statusesSet.add(row.status);
    const key = `${yearMonth} ${row.status}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
  }

  const monthly: MessageMonthlyCount[] = [...monthlyMap.entries()]
    .map(([key, count]) => {
      const [yearMonth, status] = key.split(" ");
      return { yearMonth, status, count };
    })
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  return {
    total: rows.length,
    byStatus: byStatus.map((r) => ({ status: r.status, count: r._count })),
    byChannelStatus: byChannelStatus.map((r) => ({ channel: r.channel, status: r.status, count: r._count })),
    byLegalBasisStatus: byLegalBasisStatus.map((r) => ({
      legalBasis: r.legalBasis,
      status: r.status,
      count: r._count,
    })),
    monthly,
    statuses: [...statusesSet].sort(),
  };
}
