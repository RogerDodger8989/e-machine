import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CampaignSend } from "@/components/campaign-send";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const [customers, templates] = await Promise.all([
    prisma.customer.findMany({
      where: { isDeleted: false, marketingConsent: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, phone: true, email: true },
    }),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "marketing", isActive: true },
      select: { key: true, channel: true, subject: true, body: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Kampanjer", href: "/settings/campaigns" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Skicka kampanj</h1>
      <p className="text-sm text-muted-foreground">
        Skicka ett eget manuellt utskick (t.ex. en säsongskampanj) till valda kunder som
        lämnat samtycke. Skapa en mall med rättslig grund &quot;Marknadsföring&quot; under{" "}
        Inställningar → Mallar innan du skickar.
      </p>
      <CampaignSend customers={customers} templates={templates} />
    </div>
  );
}
