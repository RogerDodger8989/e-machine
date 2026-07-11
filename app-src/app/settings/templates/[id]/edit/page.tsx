import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateMessageTemplate } from "@/app/settings/templates/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MessageBodyField } from "@/components/message-body-field";
import { TemplateVariableReference } from "@/components/template-variable-reference";

const LEGAL_BASIS_LABEL: Record<string, string> = {
  service_reminder: "Servicepåminnelse",
  marketing: "Marknadsföring",
  order_ready: "Sms",
};

export default async function EditMessageTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.messageTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  const updateThisTemplate = updateMessageTemplate.bind(null, template.id);

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Mallar för utskick", href: "/settings/templates" },
          { label: template.key, href: `/settings/templates/${template.id}/edit` },
        ]}
      />
      <h1 className="text-2xl font-semibold">Redigera mall — {template.key}</h1>

      <TemplateVariableReference />

      <Card>
        <CardHeader>
          <CardTitle>
            {template.channel === "sms" ? "SMS" : "E-post"} ·{" "}
            {LEGAL_BASIS_LABEL[template.legalBasis] ?? template.legalBasis}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateThisTemplate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Ämne (endast e-post)</Label>
              <Input id="subject" name="subject" defaultValue={template.subject ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Text *</Label>
              <MessageBodyField defaultValue={template.body} showSmsCounter={template.channel === "sms"} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" name="isActive" defaultChecked={template.isActive} />
              <Label htmlFor="isActive" className="font-normal">
                Aktiv
              </Label>
            </div>
            <Button type="submit">Spara ändringar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
