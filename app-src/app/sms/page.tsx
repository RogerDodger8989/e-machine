import { prisma } from "@/lib/db";
import { NewSmsForm } from "@/components/new-sms-form";
import { SmsHistoryTable, type SmsOrderRow } from "@/components/sms-history-table";

export const dynamic = "force-dynamic";

export default async function SmsPage() {
  const [templates, orders] = await Promise.all([
    prisma.messageTemplate.findMany({
      where: { legalBasis: "order_ready", channel: "sms", isActive: true },
      orderBy: { key: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { messageLogs: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  const templateOptions = templates.map((t) => ({
    key: t.key,
    name: TEMPLATE_DISPLAY_NAME[t.key] ?? t.key,
    body: t.body,
  }));

  const orderRows: SmsOrderRow[] = orders.map((o) => {
    const [firstLog, ...reminderLogs] = o.messageLogs;
    const lastLog = o.messageLogs[o.messageLogs.length - 1];
    return {
      id: o.id,
      phoneNumber: o.phoneNumber,
      articleDescription: o.articleDescription,
      amountDue: o.amountDue,
      createdAt: o.createdAt,
      message: firstLog?.bodySent ?? "",
      lastStatus: lastLog?.status ?? "failed",
      lastErrorMessage: lastLog?.errorMessage ?? null,
      reminderCount: reminderLogs.length,
      lastReminderAt: reminderLogs.length > 0 ? reminderLogs[reminderLogs.length - 1].createdAt : null,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sms</h1>

      <NewSmsForm templates={templateOptions} />

      <SmsHistoryTable orders={orderRows} />
    </div>
  );
}

const TEMPLATE_DISPLAY_NAME: Record<string, string> = {
  order_klar_for_hamtning: "Klar för hämtning",
  order_forsenad: "Försenad",
  order_paminnelse: "Påminnelse",
};
