import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateCampaignSheetTemplate } from "@/app/messages/campaigns/sheets/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TemplateVariableReference } from "@/components/template-variable-reference";

export default async function EditCampaignSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.messageTemplate.findUnique({ where: { id } });
  if (!template || template.legalBasis !== "campaign_sheet") notFound();

  const updateThisTemplate = updateCampaignSheetTemplate.bind(null, template.id);

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Kampanj", href: "/messages/campaigns" },
          { label: "Kampanjblad", href: "/messages/campaigns/sheets" },
          { label: template.key, href: `/messages/campaigns/sheets/${template.id}/edit` },
        ]}
      />
      <h1 className="text-2xl font-semibold">Redigera kampanjblad — {template.key}</h1>
      <TemplateVariableReference showMallarNote={false} />
      <Card>
        <CardHeader>
          <CardTitle>Kampanjbladsuppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateThisTemplate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Ämnesrad (mail)</Label>
              <Input id="subject" name="subject" defaultValue={template.subject ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Text *</Label>
              <Textarea id="body" name="body" rows={8} required defaultValue={template.body} />
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
