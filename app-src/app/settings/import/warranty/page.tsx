import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WarrantyImportWizard } from "@/components/import/warranty-import-wizard";

export const dynamic = "force-dynamic";

export default async function ImportWarrantyPage() {
  const manufacturers = await prisma.manufacturer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Importera data", href: "/settings/import" },
          { label: "Garantiprodukter", href: "/settings/import/warranty" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Importera garantiprodukter</h1>
      <p className="text-sm text-muted-foreground">
        Ladda ner exportfilen från tillverkarens återförsäljarportal (t.ex. Stiga eller Stihl) och importera
        den här — välj rätt tillverkare nedan innan du laddar upp filen.
      </p>
      <WarrantyImportWizard manufacturers={manufacturers} />
    </div>
  );
}
