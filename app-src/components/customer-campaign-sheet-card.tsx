"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { renderTemplate } from "@/lib/messaging/renderTemplate";
import { sendCampaignSheetEmail } from "@/app/machines/[id]/campaign-sheet/actions";

export interface CampaignSheetMachineOption {
  id: string;
  label: string;
  serialNumber: string;
}

export interface CampaignSheetTemplateOption {
  key: string;
  body: string;
}

export function CustomerCampaignSheetCard({
  customerName,
  hasEmail,
  hasConsent,
  shopName,
  machines,
  templates,
}: {
  customerName: string;
  hasEmail: boolean;
  hasConsent: boolean;
  shopName: string;
  machines: CampaignSheetMachineOption[];
  templates: CampaignSheetTemplateOption[];
}) {
  const router = useRouter();
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id ?? "");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(templates[0]?.key ?? "");
  const [isPending, startTransition] = useTransition();

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) ?? machines[0];
  const selectedTemplate = templates.find((t) => t.key === selectedTemplateKey) ?? templates[0];

  const previewText = useMemo(() => {
    if (!selectedTemplate || !selectedMachine) return "";
    return renderTemplate(selectedTemplate.body, {
      customer_name: customerName,
      model_name: selectedMachine.label,
      serial_number: selectedMachine.serialNumber,
      shop_name: shopName,
    });
  }, [selectedTemplate, selectedMachine, customerName, shopName]);

  function handleMail() {
    if (!selectedMachine || !selectedTemplate) return;
    startTransition(async () => {
      try {
        await sendCampaignSheetEmail(selectedMachine.id, selectedTemplate.key);
        toast.success("Kampanjbladet mailat.");
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        // Ett nytt utskicksförsök (lyckat, misslyckat eller blockerat) loggas
        // alltid server-side — uppdatera Utskicksregistret oavsett utfall.
        router.refresh();
      }
    });
  }

  if (machines.length === 0) return null;

  const mailDisabled = isPending || !hasEmail || !hasConsent || !selectedTemplate;
  const mailDisabledReason = !hasEmail
    ? "Kunden saknar e-postadress"
    : !hasConsent
      ? "Kunden har inte lämnat marknadsföringssamtycke"
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kampanjblad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inga kampanjblad finns ännu. Skapa ett under Inställningar → Kampanjblad.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {machines.length > 1 && (
                <div className="space-y-1.5">
                  <Label>Maskin</Label>
                  <Select
                    value={selectedMachineId}
                    onValueChange={(v) => v && setSelectedMachineId(v)}
                    items={Object.fromEntries(machines.map((m) => [m.id, `${m.label} (${m.serialNumber})`]))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label} ({m.serialNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Kampanjblad</Label>
                <Select
                  value={selectedTemplateKey}
                  onValueChange={(v) => v && setSelectedTemplateKey(v)}
                  items={Object.fromEntries(templates.map((t) => [t.key, t.key]))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md p-3 bg-muted/30 text-sm leading-relaxed whitespace-pre-line max-h-48 overflow-auto">
              {previewText}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" onClick={handleMail} disabled={mailDisabled} title={mailDisabledReason ?? undefined}>
                <Mail />
                {isPending ? "Skickar…" : "Maila"}
              </Button>
              {selectedMachine && (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/machines/${selectedMachine.id}/campaign-sheet`}>Visa fullständig sida</Link>}
                />
              )}
              {mailDisabledReason && <p className="text-xs text-muted-foreground">{mailDisabledReason}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
