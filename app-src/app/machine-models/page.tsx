import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MachineModelsTable, type MachineModelRow } from "@/components/machine-models-table";

export const dynamic = "force-dynamic";

export default async function MachineModelsPage() {
  const models = await prisma.machineModel.findMany({
    orderBy: [{ manufacturer: "asc" }, { modelName: "asc" }],
    include: { _count: { select: { machines: true } }, category: true },
  });

  const rows: MachineModelRow[] = models.map((m) => ({
    id: m.id,
    manufacturer: m.manufacturer,
    modelName: m.modelName,
    category: m.category?.name ?? null,
    standardWarrantyMonths: m.standardWarrantyMonths,
    standardServiceIntervalMonths: m.standardServiceIntervalMonths,
    machineCount: m._count.machines,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Maskinmodeller</h1>
        <Button nativeButton={false} render={<Link href="/machine-models/new">Ny modell</Link>} />
      </div>
      <p className="text-sm text-muted-foreground">
        Katalog över maskintyper (t.ex. Stiga Park 500W) med standardvärden för garanti
        och serviceintervall. Enskilda sålda maskiner med serienummer registreras under{" "}
        <Link href="/machines" className="underline">
          Maskiner
        </Link>
        .
      </p>

      <Card>
        <CardContent className="p-0">
          <MachineModelsTable models={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
