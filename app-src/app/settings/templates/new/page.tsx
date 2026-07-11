import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { NewTemplateForm } from "@/components/new-template-form";
import { TemplateVariableReference } from "@/components/template-variable-reference";

export default function NewMessageTemplatePage() {
  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Mallar för utskick", href: "/settings/templates" },
          { label: "Ny mall", href: "/settings/templates/new" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Ny mall</h1>

      <TemplateVariableReference />

      <Card>
        <CardHeader>
          <CardTitle>Malluppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewTemplateForm />
        </CardContent>
      </Card>
    </div>
  );
}
