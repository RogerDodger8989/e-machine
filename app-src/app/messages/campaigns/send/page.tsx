import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CampaignSend } from "@/components/campaign-send";
import { getAudienceCustomers, getAudienceFilterOptions } from "@/lib/audienceBuilder";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const [customers, filterOptions, templates] = await Promise.all([
    getAudienceCustomers(),
    getAudienceFilterOptions(),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "marketing", isActive: true },
      select: { key: true, channel: true, subject: true, body: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Kampanj", href: "/messages/campaigns" },
          { label: "Skicka kampanj", href: "/messages/campaigns/send" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Skicka kampanj</h1>
      <p className="text-sm text-muted-foreground">
        Skicka ett eget manuellt utskick (t.ex. en säsongskampanj) till valda kunder som
        lämnat samtycke — filtrera på tillverkare/kategori/modell/inköpsår för att rikta
        utskicket, eller lämna filtren tomma för alla samtyckande kunder. Skapa en mall med
        rättslig grund &quot;Marknadsföring&quot; under Inställningar → Mallar innan du skickar.
      </p>
      <CampaignSend customers={customers} templates={templates} filterOptions={filterOptions} />
    </div>
  );
}
