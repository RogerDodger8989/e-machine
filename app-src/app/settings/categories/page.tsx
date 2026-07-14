import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryManager } from "@/components/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesSettingsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { machineModels: true } } },
  });

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    machineModelCount: c._count.machineModels,
    defaultServiceIntervalMonths: c.defaultServiceIntervalMonths,
    defaultFirstServiceIntervalMonths: c.defaultFirstServiceIntervalMonths,
  }));

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Kategorier", href: "/settings/categories" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Kategorier</h1>
      <p className="text-sm text-muted-foreground">
        Kategorier används för att gruppera maskinmodeller (t.ex. &quot;Gräsklippare&quot;,
        &quot;Motorsåg&quot;, &quot;Cyklar&quot;). Döper du om en kategori här slår det igenom på
        alla modeller som använder den. Serviceintervall sätts här som ett standardvärde alla
        modeller i kategorin ärver om de inte satt ett eget (t.ex. cyklar: 3 månader första
        gången, sedan 12 månader) — en enskild modell kan alltid överstyra det under Modeller.
      </p>
      <CategoryManager categories={rows} />
    </div>
  );
}
