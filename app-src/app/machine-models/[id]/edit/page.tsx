import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateMachineModel } from "@/app/machine-models/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CategoryPicker } from "@/components/category-picker";
import { WarrantyMonthsSelect } from "@/components/warranty-months-select";

export default async function EditMachineModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [model, categories] = await Promise.all([
    prisma.machineModel.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!model) notFound();

  const updateModelWithId = updateMachineModel.bind(null, model.id);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Redigera modell</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant={model.manufacturer === "Stiga" ? "default" : "secondary"}>
              {model.manufacturer}
            </Badge>
            {model.modelName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateModelWithId} className="space-y-4">
            <CategoryPicker categories={categories} defaultValue={model.category} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="standardWarrantyMonths">Standardgaranti *</Label>
                <WarrantyMonthsSelect defaultMonths={model.standardWarrantyMonths} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="standardServiceIntervalMonths">Serviceintervall (mån)</Label>
                <Input
                  id="standardServiceIntervalMonths"
                  name="standardServiceIntervalMonths"
                  type="number"
                  min={1}
                  defaultValue={model.standardServiceIntervalMonths}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit">Spara ändringar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
