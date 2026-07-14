import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ManufacturerManager } from "@/components/manufacturer-manager";

export const dynamic = "force-dynamic";

export default async function ManufacturersSettingsPage() {
  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { machineModels: true } } },
  });

  const rows = manufacturers.map((m) => ({
    id: m.id,
    name: m.name,
    machineModelCount: m._count.machineModels,
  }));

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Tillverkare", href: "/settings/manufacturers" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Tillverkare</h1>
      <p className="text-sm text-muted-foreground">
        Tillverkare (t.ex. &quot;Stiga&quot;, &quot;Stihl&quot;, ett cykelmärke) väljs när en
        maskinmodell skapas. Döper du om en tillverkare här slår det igenom på alla modeller
        som använder den.
      </p>
      <ManufacturerManager manufacturers={rows} />
    </div>
  );
}
