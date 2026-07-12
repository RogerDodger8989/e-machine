import { Breadcrumbs } from "@/components/breadcrumbs";
import { CustomerImportWizard } from "@/components/import/customer-import-wizard";

export default function ImportCustomersPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Importera data", href: "/settings/import" },
          { label: "Kunder (Crona)", href: "/settings/import/customers" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Importera kunder från Crona</h1>
      <CustomerImportWizard />
    </div>
  );
}
