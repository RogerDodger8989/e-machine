import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplateVariableReference } from "@/components/template-variable-reference";
import { createCampaignSheetTemplate } from "@/app/settings/campaign-sheet/actions";

export default function NewCampaignSheetPage() {
  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Kampanjblad", href: "/settings/campaign-sheet" },
          { label: "Nytt kampanjblad", href: "/settings/campaign-sheet/new" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Nytt kampanjblad</h1>
      <TemplateVariableReference showMallarNote={false} />
      <Card>
        <CardHeader>
          <CardTitle>Kampanjbladsuppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCampaignSheetTemplate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="key">Namn *</Label>
              <Input id="key" name="key" required placeholder="t.ex. Standard hämt-/lämnerbjudande" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Ämnesrad (mail)</Label>
              <Input id="subject" name="subject" placeholder="Din maskin hos {{shop_name}}" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Text *</Label>
              <Textarea id="body" name="body" rows={8} required />
            </div>
            <Button type="submit">Spara kampanjblad</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
