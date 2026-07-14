import { getMessageStats, getMessageStatsByCategory } from "@/lib/messageStatistics";
import { StatistikFilters } from "@/components/statistik-filters";
import { SalesBarChart, type BarChartDatum } from "@/components/sales-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LEGAL_BASIS_LABEL } from "@/lib/legalBasis";

const STATUS_LABEL: Record<string, string> = { sent: "Skickat", failed: "Misslyckades", blocked: "Blockerat" };
const CHANNEL_LABEL: Record<string, string> = { sms: "SMS", email: "E-post" };
const STATUS_ORDER = ["sent", "blocked", "failed"];

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${MONTH_LABELS[Number(month) - 1]} ${year}`;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setMonth(from.getMonth() - 12);
  return { from: toISODate(from), to: toISODate(now) };
}

export default async function MessagesStatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const fallback = defaultRange();
  const from = params.from ?? fallback.from;
  const to = params.to ?? fallback.to;

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T23:59:59`);

  const [messageStats, categoryStats] = await Promise.all([
    getMessageStats(fromDate, toDate),
    getMessageStatsByCategory(fromDate, toDate),
  ]);

  const messageMonthlyByPeriod = new Map<string, BarChartDatum>();
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const monthEnd = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  while (cursor <= monthEnd) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    messageMonthlyByPeriod.set(key, { period: key, label: monthLabel(key), values: {} });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const row of messageStats.monthly) {
    const label = STATUS_LABEL[row.status] ?? row.status;
    const existing = messageMonthlyByPeriod.get(row.yearMonth);
    if (existing) existing.values[label] = row.count;
    else
      messageMonthlyByPeriod.set(row.yearMonth, {
        period: row.yearMonth,
        label: monthLabel(row.yearMonth),
        values: { [label]: row.count },
      });
  }
  const messageMonthlyData = [...messageMonthlyByPeriod.values()].sort((a, b) => a.period.localeCompare(b.period));
  const messageStatusCount = (status: string) => messageStats.byStatus.find((s) => s.status === status)?.count ?? 0;

  const categoryNames = [...new Set(categoryStats.map((r) => r.categoryName))].sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Statistik</h1>
        <p className="text-sm text-muted-foreground">{messageStats.total} utskick i valt intervall</p>
      </div>

      <StatistikFilters from={from} to={to} basePath="/messages/statistics" />

      <Card>
        <CardHeader>
          <CardTitle>Utskick</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <p>
              <span className="text-muted-foreground">Totalt: </span>
              <span className="font-medium tabular-nums">{messageStats.total}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Skickat: </span>
              <span className="font-medium tabular-nums">{messageStatusCount("sent")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Misslyckades: </span>
              <span className="font-medium tabular-nums">{messageStatusCount("failed")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Blockerat: </span>
              <span className="font-medium tabular-nums">{messageStatusCount("blocked")}</span>
            </p>
          </div>

          {messageStats.total === 0 ? (
            <p className="text-sm text-muted-foreground">Inga utskick registrerade i det valda intervallet.</p>
          ) : (
            <>
              <SalesBarChart
                data={messageMonthlyData}
                manufacturers={STATUS_ORDER.filter((s) => messageStats.statuses.includes(s)).map(
                  (s) => STATUS_LABEL[s] ?? s
                )}
              />
              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Visa uppdelat på kanal och typ
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kanal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Antal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messageStats.byChannelStatus.map((row) => (
                        <TableRow key={`${row.channel}-${row.status}`}>
                          <TableCell>{CHANNEL_LABEL[row.channel] ?? row.channel}</TableCell>
                          <TableCell>{STATUS_LABEL[row.status] ?? row.status}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Antal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messageStats.byLegalBasisStatus.map((row) => (
                        <TableRow key={`${row.legalBasis}-${row.status}`}>
                          <TableCell>{LEGAL_BASIS_LABEL[row.legalBasis] ?? row.legalBasis}</TableCell>
                          <TableCell>{STATUS_LABEL[row.status] ?? row.status}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </details>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utskick per maskinkategori</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="px-6 pb-4 text-sm text-muted-foreground">
            Bara utskick kopplade till en maskin räknas här (servicepåminnelser och kampanjblad) —
            rena marknadsföringskampanjer utan maskinkoppling ingår inte.
          </p>
          {categoryNames.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              Inga maskinkopplade utskick registrerade i det valda intervallet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Skickat</TableHead>
                  <TableHead className="text-right">Blockerat</TableHead>
                  <TableHead className="text-right">Misslyckades</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryNames.map((categoryName) => {
                  const countFor = (status: string) =>
                    categoryStats.find((r) => r.categoryName === categoryName && r.status === status)?.count ?? 0;
                  return (
                    <TableRow key={categoryName}>
                      <TableCell className="font-medium">{categoryName}</TableCell>
                      <TableCell className="text-right tabular-nums">{countFor("sent")}</TableCell>
                      <TableCell className="text-right tabular-nums">{countFor("blocked")}</TableCell>
                      <TableCell className="text-right tabular-nums">{countFor("failed")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
