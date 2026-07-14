import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyButton } from "@/components/copy-button";
import { resolveServiceIntervals } from "@/lib/serviceInterval";

export const dynamic = "force-dynamic";

function customerLabel(customer: { name: string; company: string | null }): string {
  return customer.company ? `${customer.company} - ${customer.name}` : customer.name;
}

export default async function MachineModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const model = await prisma.machineModel.findUnique({
    where: { id },
    include: {
      category: true,
      manufacturer: true,
      machines: {
        orderBy: { createdAt: "desc" },
        include: {
          ownerships: {
            where: { ownedUntil: null },
            include: { customer: true },
          },
        },
      },
      campaignSheetLinks: { include: { template: true }, orderBy: { template: { key: "asc" } } },
    },
  });

  if (!model) notFound();

  const { recurringMonths, firstMonths } = resolveServiceIntervals(model, model.category);
  const recurringIsInherited = model.standardServiceIntervalMonths === null;
  const firstIsInherited = model.firstServiceIntervalMonths === null;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Modeller", href: "/machine-models" },
          { label: `${model.manufacturer.name} ${model.modelName}`, href: `/machine-models/${model.id}` },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{model.manufacturer.name}</Badge>
            <h1 className="text-2xl font-semibold">{model.modelName}</h1>
          </div>
          {model.category && <p className="text-muted-foreground mt-1">{model.category.name}</p>}
        </div>
        <Button
          className="self-start"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/machine-models/${model.id}/edit`}>Redigera</Link>}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standardvärden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Garanti: </span>
              {model.standardWarrantyMonths} månader
            </div>
            <div>
              <span className="text-muted-foreground">Serviceintervall: </span>
              {recurringMonths} månader{recurringIsInherited && " (ärvt från kategori)"}
            </div>
            {firstMonths !== recurringMonths && (
              <div>
                <span className="text-muted-foreground">Första servicen: </span>
                {firstMonths} månader{firstIsInherited && " (ärvt från kategori)"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kampanjblad ({model.campaignSheetLinks.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/machine-models/${model.id}/edit`}>Redigera</Link>}
            />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {model.campaignSheetLinks.length === 0 ? (
              <p className="text-muted-foreground">
                Inga kampanjblad kopplade — maskiner av denna modell visar ingen
                &quot;Skriv ut kampanjblad&quot;-knapp.
              </p>
            ) : (
              <ul className="space-y-1">
                {model.campaignSheetLinks.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    {l.template.key}
                    {!l.template.isActive && <Badge variant="secondary">Inaktiv</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Maskiner av denna modell ({model.machines.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/machines/new?modelId=${model.id}`}>Lägg till maskin</Link>}
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {model.machines.length === 0 && (
              <p className="text-sm text-muted-foreground">Inga registrerade maskiner ännu.</p>
            )}
            {model.machines.map((m) => {
              const owner = m.ownerships[0]?.customer;
              return (
                <Link
                  key={m.id}
                  href={`/machines/${m.id}`}
                  className="block rounded-md border p-3 text-sm hover:bg-muted"
                >
                  <div className="font-medium inline-flex items-center gap-1">
                    {m.serialNumber}
                    <CopyButton
                      value={m.serialNumber}
                      copiedMessage="Serienummer kopierat"
                      ariaLabel="Kopiera serienummer"
                    />
                  </div>
                  <div className="text-muted-foreground">
                    {owner ? customerLabel(owner) : "Ingen ägare"}
                    {owner?.phone && ` · ${owner.phone}`}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    Inköpsdatum: {m.purchaseDate ? m.purchaseDate.toLocaleDateString("sv-SE") : "—"}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
