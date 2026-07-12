import { Breadcrumbs } from "@/components/breadcrumbs";
import { WarrantyImportWizard } from "@/components/import/warranty-import-wizard";

export default function ImportWarrantyPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Importera data", href: "/settings/import" },
          { label: "Garantiprodukter (Stiga/Stihl)", href: "/settings/import/warranty" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Importera garantiprodukter</h1>
      <p className="text-sm text-muted-foreground">
        Ladda ner exportfilen från Stigas eller Stihls återförsäljarportal och importera den här. Fungerar för
        registrerade produkter från båda tillverkarna — välj rätt tillverkare nedan innan du laddar upp filen.
      </p>
      <WarrantyImportWizard />
    </div>
  );
}
