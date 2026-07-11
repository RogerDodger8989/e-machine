import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModelMultiSelect } from "@/components/model-multi-select";
import { MachinesTable, type MachineRow } from "@/components/machines-table";

export const dynamic = "force-dynamic";

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<{ modelId?: string }>;
}) {
  const { modelId } = await searchParams;
  const selectedModelIds = modelId ? modelId.split(",").filter(Boolean) : [];

  const [machines, models] = await Promise.all([
    prisma.machine.findMany({
      where: selectedModelIds.length > 0 ? { modelId: { in: selectedModelIds } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        model: { include: { category: true } },
        ownerships: { where: { ownedUntil: null }, include: { customer: true } },
      },
    }),
    prisma.machineModel.findMany({ orderBy: [{ manufacturer: "asc" }, { modelName: "asc" }] }),
  ]);

  const rows: MachineRow[] = machines.map((m) => {
    const owner = m.ownerships[0]?.customer;
    return {
      id: m.id,
      serialNumber: m.serialNumber,
      manufacturer: m.model.manufacturer,
      modelName: m.model.modelName,
      category: m.model.category?.name ?? null,
      modelId: m.model.id,
      ownerCustomerId: owner?.id ?? null,
      company: owner?.company ?? null,
      contactPerson: owner?.name ?? null,
      warrantyEndDate: m.warrantyEndDate?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Maskiner</h1>
        <div className="flex items-center gap-2">
          <ModelMultiSelect models={models} selectedModelIds={selectedModelIds} />
          <Button nativeButton={false} render={<Link href="/machines/new">Ny maskin</Link>} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Enskilda maskiner med serienummer, kopplade till en ägare. Ny maskintyp (t.ex. en
        ny modell från Stiga/Stihl)?{" "}
        <Link href="/machine-models/new" className="underline">
          Lägg till den under Modeller
        </Link>
        .
      </p>

      <Card>
        <CardContent className="p-0">
          <MachinesTable machines={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
