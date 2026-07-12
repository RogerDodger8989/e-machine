import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CampaignSheetBulkSend } from "@/components/campaign-sheet-bulk-send";

export const dynamic = "force-dynamic";

export default async function CampaignSheetSendPage() {
  const [templates, machines] = await Promise.all([
    prisma.messageTemplate.findMany({
      where: { legalBasis: "campaign_sheet", isActive: true },
      select: { key: true },
      orderBy: { key: "asc" },
    }),
    prisma.machine.findMany({
      where: {
        ownerships: {
          some: { ownedUntil: null, customer: { marketingConsent: true, isDeleted: false, email: { not: null } } },
        },
      },
      include: {
        model: true,
        ownerships: { where: { ownedUntil: null }, include: { customer: true } },
      },
      orderBy: { serialNumber: "asc" },
    }),
  ]);

  const recipients = machines
    .map((m) => {
      const owner = m.ownerships[0]?.customer;
      if (!owner?.email) return null;
      return {
        machineId: m.id,
        customerName: owner.company ? `${owner.company} - ${owner.name}` : owner.name,
        email: owner.email,
        modelLabel: `${m.model.manufacturer} ${m.model.modelName}`,
        serialNumber: m.serialNumber,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Kampanjblad", href: "/settings/campaign-sheet" },
          { label: "Maila till flera kunder", href: "/settings/campaign-sheet/send" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Maila kampanjblad till flera kunder</h1>
      <p className="text-sm text-muted-foreground">
        Listan visar bara maskiner vars ägare har lämnat marknadsföringssamtycke och har en
        registrerad e-postadress.
      </p>
      <CampaignSheetBulkSend templateKeys={templates.map((t) => t.key)} recipients={recipients} />
    </div>
  );
}
