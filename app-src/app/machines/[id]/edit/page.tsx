import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditMachineForm } from "@/components/edit-machine-form";
import { warrantySelectionFromDates } from "@/lib/warranty";

export default async function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machine, models] = await Promise.all([
    prisma.machine.findUnique({ where: { id }, include: { model: { include: { manufacturer: true } } } }),
    prisma.machineModel.findMany({
      include: { manufacturer: true },
      orderBy: [{ manufacturer: { name: "asc" } }, { modelName: "asc" }],
    }),
  ]);
  if (!machine) notFound();

  const modelOptions = models.map((m) => ({
    id: m.id,
    manufacturer: m.manufacturer.name,
    modelName: m.modelName,
    standardWarrantyMonths: m.standardWarrantyMonths,
  }));

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: `${machine.model.manufacturer.name} ${machine.model.modelName}`, href: `/machines/${machine.id}` },
          { label: "Redigera", href: `/machines/${machine.id}/edit` },
        ]}
      />
      <h1 className="text-2xl font-semibold">Redigera maskin</h1>

      <Card>
        <CardHeader>
          <CardTitle>Maskinuppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <EditMachineForm
            machineId={machine.id}
            models={modelOptions}
            initialModelId={machine.modelId}
            serialNumber={machine.serialNumber}
            purchaseDate={machine.purchaseDate?.toISOString().slice(0, 10) ?? ""}
            notes={machine.notes ?? ""}
            initialWarrantySelection={warrantySelectionFromDates(machine.purchaseDate, machine.warrantyEndDate)}
            initialWarrantyEndDate={machine.warrantyEndDate?.toISOString().slice(0, 10) ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
