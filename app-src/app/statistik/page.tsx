import { getMachineSalesStats } from "@/lib/statistics";
import { StatistikFilters } from "@/components/statistik-filters";
import { SalesBarChart, type BarChartDatum } from "@/components/sales-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

const MONTH_LABELS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

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

export default async function StatistikPage({
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

  const stats = await getMachineSalesStats(fromDate, toDate);

  const monthlyByPeriod = new Map<string, BarChartDatum>();
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const monthEnd = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  while (cursor <= monthEnd) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    monthlyByPeriod.set(key, { period: key, label: monthLabel(key), values: {} });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const row of stats.monthly) {
    const existing = monthlyByPeriod.get(row.yearMonth);
    if (existing) existing.values[row.manufacturer] = row.count;
    else
      monthlyByPeriod.set(row.yearMonth, {
        period: row.yearMonth,
        label: monthLabel(row.yearMonth),
        values: { [row.manufacturer]: row.count },
      });
  }
  const monthlyData = [...monthlyByPeriod.values()].sort((a, b) => a.period.localeCompare(b.period));

  const yearlyByPeriod = new Map<string, BarChartDatum>();
  for (let y = fromDate.getFullYear(); y <= toDate.getFullYear(); y++) {
    yearlyByPeriod.set(String(y), { period: String(y), label: String(y), values: {} });
  }
  for (const row of stats.yearly) {
    const existing = yearlyByPeriod.get(row.year);
    if (existing) existing.values[row.manufacturer] = row.count;
    else
      yearlyByPeriod.set(row.year, {
        period: row.year,
        label: row.year,
        values: { [row.manufacturer]: row.count },
      });
  }
  const yearlyData = [...yearlyByPeriod.values()].sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Statistik</h1>
        <p className="text-sm text-muted-foreground">
          {stats.totalCount} sålda maskiner i valt intervall
        </p>
      </div>

      <StatistikFilters from={from} to={to} />

      {stats.manufacturers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Inga sålda maskiner registrerade i det valda intervallet.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sålda maskiner per tillverkare</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="month">
              <TabsList>
                <TabsTrigger value="month">Månad för månad</TabsTrigger>
                <TabsTrigger value="year">År för år</TabsTrigger>
              </TabsList>
              <TabsContent value="month" className="pt-4 space-y-4">
                <SalesBarChart data={monthlyData} manufacturers={stats.manufacturers} />
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Visa som tabell
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Månad</TableHead>
                          {stats.manufacturers.map((m) => (
                            <TableHead key={m} className="text-right">
                              {m}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyData.map((row) => (
                          <TableRow key={row.period}>
                            <TableCell>{row.label}</TableCell>
                            {stats.manufacturers.map((m) => (
                              <TableCell key={m} className="text-right tabular-nums">
                                {row.values[m] ?? 0}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </details>
              </TabsContent>
              <TabsContent value="year" className="pt-4 space-y-4">
                <SalesBarChart data={yearlyData} manufacturers={stats.manufacturers} />
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Visa som tabell
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>År</TableHead>
                          {stats.manufacturers.map((m) => (
                            <TableHead key={m} className="text-right">
                              {m}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearlyData.map((row) => (
                          <TableRow key={row.period}>
                            <TableCell>{row.label}</TableCell>
                            {stats.manufacturers.map((m) => (
                              <TableCell key={m} className="text-right tabular-nums">
                                {row.values[m] ?? 0}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </details>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sålda maskiner per modell</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tillverkare</TableHead>
                <TableHead>Modell</TableHead>
                <TableHead className="text-right">Antal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byModel.map((row) => (
                <TableRow key={row.modelId}>
                  <TableCell>{row.manufacturer}</TableCell>
                  <TableCell className="font-medium">{row.modelName}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                </TableRow>
              ))}
              {stats.byModel.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Inga sålda maskiner i det valda intervallet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
