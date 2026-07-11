import { prisma } from "@/lib/db";
import { getResendEligibility } from "@/lib/messaging/resend";
import { MessageLogTable } from "@/components/message-log-table";
import { MessageLogFilters } from "@/components/message-log-filters";
import { ResendAllButton } from "@/components/resend-all-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  return { from: toISODate(from), to: toISODate(now) };
}

function customerLabel(c: { name: string; company: string | null }): string {
  return c.company ? `${c.company} - ${c.name}` : c.name;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    channel?: string;
    legalBasis?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const fallback = defaultRange();
  const from = params.from ?? fallback.from;
  const to = params.to ?? fallback.to;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T23:59:59`);
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.MessageLogWhereInput = {
    createdAt: { gte: fromDate, lte: toDate },
    ...(params.status && { status: params.status }),
    ...(params.channel && { channel: params.channel }),
    ...(params.legalBasis && { legalBasis: params.legalBasis }),
  };

  const [logs, total, unresolvedCount] = await Promise.all([
    prisma.messageLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { id: true, name: true, company: true, isDeleted: true } },
        retries: { select: { id: true } },
      },
    }),
    prisma.messageLog.count({ where }),
    prisma.messageLog.count({ where: { status: "failed", retries: { none: {} } } }),
  ]);

  const rows = logs.map((log) => {
    const { canResend, reason } = getResendEligibility(log, log.customer?.isDeleted ?? false);
    return {
      ...log,
      customerLabel: log.customer ? customerLabel(log.customer) : undefined,
      canResend,
      resendDisabledReason: reason,
      wasRetried: log.retries.length > 0,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseParams = new URLSearchParams();
  if (params.status) baseParams.set("status", params.status);
  if (params.channel) baseParams.set("channel", params.channel);
  if (params.legalBasis) baseParams.set("legalBasis", params.legalBasis);
  baseParams.set("from", from);
  baseParams.set("to", to);

  function pageHref(p: number): string {
    const sp = new URLSearchParams(baseParams);
    sp.set("page", String(p));
    return `/messages?${sp.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Utskick</h1>
        <p className="text-sm text-muted-foreground">{unresolvedCount} olösta misslyckanden totalt</p>
      </div>

      <MessageLogFilters
        status={params.status ?? "all"}
        channel={params.channel ?? "all"}
        legalBasis={params.legalBasis ?? "all"}
        from={from}
        to={to}
      />

      <ResendAllButton count={unresolvedCount} />

      <Card>
        <CardContent className="p-0">
          <MessageLogTable logs={rows} showCustomer />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-muted-foreground">
        <p>
          Visar {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} av {total}
        </p>
        <div className="flex gap-2">
          {page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              Föregående
            </Button>
          ) : (
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={pageHref(page - 1)}>Föregående</a>} />
          )}
          {page >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              Nästa
            </Button>
          ) : (
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={pageHref(page + 1)}>Nästa</a>} />
          )}
        </div>
      </div>
    </div>
  );
}
