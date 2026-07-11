import { prisma } from "@/lib/db";
import { getDueServiceReminders } from "@/lib/jobs/serviceReminders";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceRemindersReview } from "@/components/service-reminders-review";

export const dynamic = "force-dynamic";

export default async function ServiceRemindersPage() {
  const [reminders, smsTemplate, emailTemplate] = await Promise.all([
    getDueServiceReminders(),
    prisma.messageTemplate.findUnique({ where: { key: "service_reminder_sms" } }),
    prisma.messageTemplate.findUnique({ where: { key: "service_reminder_email" } }),
  ]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Servicepåminnelser", href: "/settings/service-reminders" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Servicepåminnelser</h1>
      <p className="text-sm text-muted-foreground">
        Maskiner som är aktuella för en påminnelse just nu (ca 2 månader innan nästa
        service, dvs. ~10 månader efter inköp för en maskin med 1 års serviceintervall).
        Välj vilka som ska få ett utskick och på vilken kanal — inget skickas förrän du
        klickar Skicka.
      </p>
      <ServiceRemindersReview
        reminders={reminders}
        smsAvailable={Boolean(smsTemplate?.isActive)}
        emailAvailable={Boolean(emailTemplate?.isActive)}
      />
    </div>
  );
}
