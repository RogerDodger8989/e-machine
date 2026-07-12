import { Breadcrumbs } from "@/components/breadcrumbs";
import { OwnershipImportWizard } from "@/components/import/ownership-import-wizard";

export default function ImportOwnershipPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Importera data", href: "/settings/import" },
          { label: "Maskinägande (Crona)", href: "/settings/import/ownership" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Importera maskinägande från Crona</h1>
      <p className="text-sm text-muted-foreground">
        Importera kunder från Crona (steg 1) innan denna fil — annars matchas ingen kund och alla rader hoppas
        över.
      </p>
      <OwnershipImportWizard />
    </div>
  );
}
