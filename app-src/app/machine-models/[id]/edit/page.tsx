import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateMachineModel } from "@/app/machine-models/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CategoryPicker } from "@/components/category-picker";
import { WarrantyMonthsSelect } from "@/components/warranty-months-select";
import { resolveServiceIntervals } from "@/lib/serviceInterval";

export default async function EditMachineModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [model, categories, campaignSheetTemplates] = await Promise.all([
    prisma.machineModel.findUnique({
      where: { id },
      include: { category: true, manufacturer: true, campaignSheetLinks: { select: { templateId: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.messageTemplate.findMany({
      where: { legalBasis: "campaign_sheet", isActive: true },
      select: { id: true, key: true },
      orderBy: { key: "asc" },
    }),
  ]);
  if (!model) notFound();

  const updateModelWithId = updateMachineModel.bind(null, model.id);
  const { recurringMonths, firstMonths } = resolveServiceIntervals(model, model.category);
  const linkedTemplateIds = new Set(model.campaignSheetLinks.map((l) => l.templateId));

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Redigera modell</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">{model.manufacturer.name}</Badge>
            {model.modelName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateModelWithId} className="space-y-4">
            <CategoryPicker categories={categories} defaultValue={model.category} />
            <div className="space-y-1.5">
              <Label htmlFor="standardWarrantyMonths">Standardgaranti *</Label>
              <WarrantyMonthsSelect defaultMonths={model.standardWarrantyMonths} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="standardServiceIntervalMonths">Serviceintervall (mån)</Label>
                <Input
                  id="standardServiceIntervalMonths"
                  name="standardServiceIntervalMonths"
                  type="number"
                  min={1}
                  placeholder={`${recurringMonths} (från kategori)`}
                  defaultValue={model.standardServiceIntervalMonths ?? ""}
                />
                <p className="text-xs text-muted-foreground">
                  Lämna tomt för att ärva kategorins standardvärde ({recurringMonths} mån).
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstServiceIntervalMonths">Första servicen (mån)</Label>
                <Input
                  id="firstServiceIntervalMonths"
                  name="firstServiceIntervalMonths"
                  type="number"
                  min={1}
                  placeholder={`${firstMonths} (från kategori)`}
                  defaultValue={model.firstServiceIntervalMonths ?? ""}
                />
                <p className="text-xs text-muted-foreground">
                  Lämna tomt om första servicen inte skiljer sig från ovan.
                </p>
              </div>
            </div>
            {campaignSheetTemplates.length > 0 && (
              <div className="space-y-1.5">
                <Label>Kampanjblad</Label>
                <div className="space-y-1.5 border rounded-md p-3">
                  {campaignSheetTemplates.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        name="campaignSheetTemplateIds"
                        value={t.id}
                        defaultChecked={linkedTemplateIds.has(t.id)}
                      />
                      {t.key}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maskiner av denna modell får en &quot;Skriv ut kampanjblad&quot;-knapp om minst en mall är ikryssad.
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit">Spara ändringar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
