import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UnlinkMachineButton } from "@/components/unlink-machine-button";
import { CopyButton } from "@/components/copy-button";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

function customerLabel(customer: { name: string; company: string | null }): string {
  return customer.company ? `${customer.company} - ${customer.name}` : customer.name;
}

export default async function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const machine = await prisma.machine.findUnique({
    where: { id },
    include: {
      model: {
        include: {
          manufacturer: true,
          campaignSheetLinks: {
            where: { template: { isActive: true } },
            select: { template: { select: { key: true } } },
          },
        },
      },
      ownerships: {
        orderBy: { ownedFrom: "desc" },
        include: { customer: true },
      },
    },
  });

  if (!machine) notFound();

  const activeOwnership = machine.ownerships.find((o) => o.ownedUntil === null);
  const pastOwnerships = machine.ownerships.filter((o) => o.ownedUntil !== null);
  const hasCampaignSheet = machine.model.campaignSheetLinks.length > 0;

  const breadcrumbItems: BreadcrumbItem[] = [];
  if (activeOwnership) {
    breadcrumbItems.push({
      label: `${customerLabel(activeOwnership.customer)}${activeOwnership.customer.phone ? " " + activeOwnership.customer.phone : ""}`,
      href: `/customers/${activeOwnership.customer.id}`,
    });
  }
  breadcrumbItems.push({
    label: `${machine.model.manufacturer.name} ${machine.model.modelName}`,
    href: `/machine-models/${machine.model.id}`,
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{machine.model.manufacturer.name}</Badge>
            <h1 className="text-2xl font-semibold">{machine.model.modelName}</h1>
          </div>
          <p className="text-muted-foreground mt-1 inline-flex items-center gap-1">
            Serienr: {machine.serialNumber}
            <CopyButton value={machine.serialNumber} copiedMessage="Serienummer kopierat" ariaLabel="Kopiera serienummer" />
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/machines/${machine.id}/edit`}>Redigera</Link>}
          />
          {hasCampaignSheet && activeOwnership && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/machines/${machine.id}/campaign-sheet`}>Skriv ut kampanjblad</Link>}
                  />
                }
              />
              <TooltipContent>
                {machine.model.campaignSheetLinks.map((l) => l.template.key).join(", ")}
              </TooltipContent>
            </Tooltip>
          )}
          {activeOwnership && <UnlinkMachineButton machineId={machine.id} />}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maskindetaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Inköpsdatum: </span>
              {machine.purchaseDate ? machine.purchaseDate.toLocaleDateString("sv-SE") : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Garanti t.o.m.: </span>
              {machine.warrantyEndDate ? machine.warrantyEndDate.toLocaleDateString("sv-SE") : "—"}
            </div>
            {machine.notes && (
              <div>
                <span className="text-muted-foreground">Anteckningar: </span>
                {machine.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ägare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {activeOwnership ? (
              <Link
                href={`/customers/${activeOwnership.customer.id}`}
                className="block rounded-md border p-3 hover:bg-muted"
              >
                <div className="font-medium">{customerLabel(activeOwnership.customer)}</div>
                {activeOwnership.customer.phone && <div>{activeOwnership.customer.phone}</div>}
                <div className="text-muted-foreground">
                  Ägare sedan {activeOwnership.ownedFrom.toLocaleDateString("sv-SE")}
                </div>
              </Link>
            ) : (
              <p className="text-muted-foreground">Ingen nuvarande ägare.</p>
            )}
            {pastOwnerships.length > 0 && (
              <details className="text-muted-foreground">
                <summary className="cursor-pointer">
                  {pastOwnerships.length} tidigare ägare
                </summary>
                <div className="mt-2 space-y-2">
                  {pastOwnerships.map((o) => (
                    <div key={o.id} className="rounded-md border p-2">
                      {customerLabel(o.customer)} ({o.ownedFrom.toLocaleDateString("sv-SE")} –{" "}
                      {o.ownedUntil?.toLocaleDateString("sv-SE")}, {o.unlinkReason})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
