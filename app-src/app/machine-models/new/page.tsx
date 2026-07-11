import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewMachineModelForm } from "@/components/new-machine-model-form";

export default async function NewMachineModelPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Ny maskinmodell</h1>

      <Card>
        <CardHeader>
          <CardTitle>Modelluppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewMachineModelForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
