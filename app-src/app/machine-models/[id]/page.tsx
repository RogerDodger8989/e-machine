import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
      machines: {
        orderBy: { createdAt: "desc" },
        include: {
          ownerships: {
            where: { ownedUntil: null },
            include: { customer: true },
          },
        },
      },
    },
  });

  if (!model) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Modeller", href: "/machine-models" },
          { label: `${model.manufacturer} ${model.modelName}`, href: `/machine-models/${model.id}` },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={model.manufacturer === "Stiga" ? "default" : "secondary"}>
              {model.manufacturer}
            </Badge>
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
              {model.standardServiceIntervalMonths} månader
            </div>
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
                  <div className="font-medium">{m.serialNumber}</div>
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
