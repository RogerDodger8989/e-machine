import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewMachineForm } from "@/components/new-machine-form";
import { NEW_MODEL_SENTINEL } from "@/lib/machineModels";

export const dynamic = "force-dynamic";

export default async function NewMachinePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; modelId?: string }>;
}) {
  const { customerId, modelId } = await searchParams;

  const [customers, models, categories, manufacturers] = await Promise.all([
    prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, phone: true },
    }),
    prisma.machineModel.findMany({
      include: { manufacturer: true },
      orderBy: [{ manufacturer: { name: "asc" } }, { modelName: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
  ]);

  const modelOptions = models.map((m) => ({
    id: m.id,
    manufacturer: m.manufacturer.name,
    modelName: m.modelName,
    standardWarrantyMonths: m.standardWarrantyMonths,
  }));

  // Inga modeller ännu? Fäll ut "ny modell"-panelen direkt istället för att
  // visa en tom lista man ändå bara kan välja ett alternativ ur.
  const initialModelId = modelId ?? (models.length === 0 ? NEW_MODEL_SENTINEL : undefined);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Ny maskin</h1>

      <Card>
        <CardHeader>
          <CardTitle>Maskinuppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewMachineForm
            customers={customers}
            models={modelOptions}
            categories={categories}
            manufacturers={manufacturers}
            initialCustomerId={customerId}
            initialModelId={initialModelId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
