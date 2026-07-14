import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewMachineModelForm } from "@/components/new-machine-model-form";

export default async function NewMachineModelPage() {
  const [categories, manufacturers, campaignSheetTemplates] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "campaign_sheet", isActive: true },
      select: { id: true, key: true },
      orderBy: { key: "asc" },
    }),
  ]);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Ny maskinmodell</h1>

      <Card>
        <CardHeader>
          <CardTitle>Modelluppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewMachineModelForm
            categories={categories}
            manufacturers={manufacturers}
            campaignSheetTemplates={campaignSheetTemplates}
          />
        </CardContent>
      </Card>
    </div>
  );
}
