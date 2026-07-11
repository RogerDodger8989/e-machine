import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCompanyProfile } from "@/lib/companyProfile";
import { PrintButton } from "@/components/print-button";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

function customerLabel(customer: { name: string; company: string | null }): string {
  return customer.company ? `${customer.company} - ${customer.name}` : customer.name;
}

export default async function CampaignSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [machine, company] = await Promise.all([
    prisma.machine.findUnique({
      where: { id },
      include: {
        model: true,
        ownerships: { where: { ownedUntil: null }, include: { customer: true } },
      },
    }),
    getCompanyProfile(),
  ]);

  if (!machine || !machine.offersPickupService) notFound();
  const owner = machine.ownerships[0]?.customer;
  if (!owner) notFound();

  const customerAddressLines = [owner.address, [owner.postalCode, owner.city].filter(Boolean).join(" ")].filter(
    Boolean
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: customerLabel(owner), href: `/customers/${owner.id}` },
    { label: `${machine.model.manufacturer} ${machine.model.modelName}`, href: `/machines/${machine.id}` },
    { label: "Kampanjblad", href: `/machines/${machine.id}/campaign-sheet` },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="no-print space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <PrintButton />
      </div>

      <div className="border rounded-lg p-10 bg-white text-black space-y-10 print:border-0 print:rounded-none print:p-0">
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

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Hej {owner.name}!
          </p>
          <p>
            Din {machine.model.manufacturer} {machine.model.modelName} (serienr {machine.serialNumber}) är
            registrerad hos oss. För att bibehålla kvaliteten på maskinen du köpt rekommenderar vi en
            service var 50:e mil eller en gång per år.
          </p>
          <p>
            Vi erbjuder hämtning samt återlämning av maskiner för detta till ett pris av 900:- inom
            Skåne.
          </p>
        </div>
      </div>
    </div>
  );
}
