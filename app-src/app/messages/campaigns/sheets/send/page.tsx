import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CampaignSheetBulkSend } from "@/components/campaign-sheet-bulk-send";
import { getAudienceCustomers, getAudienceFilterOptions } from "@/lib/audienceBuilder";

export const dynamic = "force-dynamic";

export default async function CampaignSheetSendPage() {
  const [customers, filterOptions, templates] = await Promise.all([
    getAudienceCustomers(),
    getAudienceFilterOptions(),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "campaign_sheet", isActive: true },
      select: { key: true },
      orderBy: { key: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Kampanj", href: "/messages/campaigns" },
          { label: "Kampanjblad", href: "/messages/campaigns/sheets" },
          { label: "Maila till flera kunder", href: "/messages/campaigns/sheets/send" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Maila kampanjblad till flera kunder</h1>
      <p className="text-sm text-muted-foreground">
        Listan visar bara maskiner vars ägare har lämnat marknadsföringssamtycke och har en
        registrerad e-postadress — filtrera på tillverkare/kategori/modell/inköpsår för att
        rikta utskicket.
      </p>
      <CampaignSheetBulkSend templateKeys={templates.map((t) => t.key)} customers={customers} filterOptions={filterOptions} />
    </div>
  );
}
