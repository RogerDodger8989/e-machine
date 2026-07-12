import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCompanyProfile } from "@/lib/companyProfile";
import { renderTemplate } from "@/lib/messaging/renderTemplate";
import { CampaignSheetView } from "@/components/campaign-sheet-view";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

function customerLabel(customer: { name: string; company: string | null }): string {
  return customer.company ? `${customer.company} - ${customer.name}` : customer.name;
}

export default async function CampaignSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [machine, company, templates] = await Promise.all([
    prisma.machine.findUnique({
      where: { id },
      include: {
        model: true,
        ownerships: { where: { ownedUntil: null }, include: { customer: true } },
      },
    }),
    getCompanyProfile(),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "campaign_sheet", isActive: true },
      orderBy: { key: "asc" },
    }),
  ]);

  if (!machine || !machine.offersPickupService) notFound();
  const owner = machine.ownerships[0]?.customer;
  if (!owner) notFound();

  const variables = {
    customer_name: owner.name,
    model_name: `${machine.model.manufacturer} ${machine.model.modelName}`,
    serial_number: machine.serialNumber,
    shop_name: company.companyName || "Verkstaden",
  };

  const options = templates.map((t) => ({ key: t.key, renderedBody: renderTemplate(t.body, variables) }));

  const customerAddressLines = [owner.address, [owner.postalCode, owner.city].filter(Boolean).join(" ")].filter(
    Boolean
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: customerLabel(owner), href: `/customers/${owner.id}` },
    { label: `${machine.model.manufacturer} ${machine.model.modelName}`, href: `/machines/${machine.id}` },
    { label: "Kampanjblad", href: `/machines/${machine.id}/campaign-sheet` },
  ];

  const header = (
    <>
      {company.companyLogoDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={company.companyLogoDataUrl} alt={company.companyName || "Logga"} className="h-16 w-auto" />
      )}

      <div className="flex items-start justify-between gap-8 text-sm">
        <div>
          <p className="font-medium">{customerLabel(owner)}</p>
          {customerAddressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="text-right text-muted-foreground">
          {company.companyName && <p className="font-medium text-black">{company.companyName}</p>}
          {company.companyAddress &&
            company.companyAddress.split("\n").map((line) => <p key={line}>{line}</p>)}
          {company.companyPhone && <p>Tel: {company.companyPhone}</p>}
          {company.companyOrgNumber && <p>Org.nr: {company.companyOrgNumber}</p>}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="no-print space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <CampaignSheetView
        machineId={machine.id}
        options={options}
        hasEmail={!!owner.email}
        hasConsent={owner.marketingConsent}
        header={header}
      />
    </div>
  );
}
