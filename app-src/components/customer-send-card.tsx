"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { renderTemplate } from "@/lib/messaging/renderTemplate";
import { sendCampaignSheetEmail } from "@/app/machines/[id]/campaign-sheet/actions";
import { sendCampaign } from "@/app/messages/campaigns/send/actions";

export interface CustomerSendMachineOption {
  id: string;
  label: string;
  serialNumber: string;
}

export interface CustomerSendTemplateOption {
  key: string;
  legalBasis: string;
  body: string;
}

const LEGAL_BASIS_GROUP_LABEL: Record<string, string> = {
  marketing: "Kampanj",
  campaign_sheet: "Kampanjblad",
};

export function CustomerSendCard({
  customerId,
  customerName,
  hasEmail,
  hasConsent,
  shopName,
  machines,
  templates,
}: {
  customerId: string;
  customerName: string;
  hasEmail: boolean;
  hasConsent: boolean;
  shopName: string;
  machines: CustomerSendMachineOption[];
  templates: CustomerSendTemplateOption[];
}) {
  const router = useRouter();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(templates[0]?.key ?? "");
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const selectedTemplate = templates.find((t) => t.key === selectedTemplateKey) ?? templates[0];
  const isCampaignSheet = selectedTemplate?.legalBasis === "campaign_sheet";

  const previewMachine =
    machines.find((m) => selectedMachineIds.has(m.id)) ?? machines[0];

  const previewText = useMemo(() => {
    if (!selectedTemplate) return "";
    return renderTemplate(selectedTemplate.body, {
      customer_name: customerName,
      model_name: previewMachine?.label ?? "",
      serial_number: previewMachine?.serialNumber ?? "",
      shop_name: shopName,
    });
  }, [selectedTemplate, previewMachine, customerName, shopName]);

  function toggleMachine(id: string) {
    setSelectedMachineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleMail() {
    if (!selectedTemplate) return;
    startTransition(async () => {
      try {
        if (isCampaignSheet) {
          const machineIds = [...selectedMachineIds];
          let sent = 0;
          let failed = 0;
          for (const machineId of machineIds) {
            try {
              await sendCampaignSheetEmail(machineId, selectedTemplate.key);
              sent++;
            } catch {
              failed++;
            }
          }
          if (failed === 0) toast.success(sent === 1 ? "Kampanjbladet mailat." : `${sent} kampanjblad mailade.`);
          else toast.error(`${sent} mailade, ${failed} misslyckades.`);
        } else {
          const res = await sendCampaign([customerId], [selectedTemplate.key]);
          if (res.sent > 0) toast.success("Mailet skickat.");
          else if (res.skipped > 0) toast.error("Redan skickat nyligen — hoppades över.");
          else if (res.blocked > 0) toast.error("Kunde inte skicka — kunden saknar samtycke eller kontaktväg.");
          else toast.error("Kunde inte skicka.");
        }
      } finally {
        // Ett nytt utskicksförsök (lyckat, misslyckat eller blockerat) loggas
        // alltid server-side — uppdatera Utskicksregistret oavsett utfall.
        router.refresh();
      }
    });
  }

  if (machines.length === 0 && templates.length === 0) return null;

  const mailDisabled =
    isPending ||
    !hasEmail ||
    !hasConsent ||
    !selectedTemplate ||
    (isCampaignSheet && selectedMachineIds.size === 0);
  const mailDisabledReason = !hasEmail
    ? "Kunden saknar e-postadress"
    : !hasConsent
      ? "Kunden har inte lämnat marknadsföringssamtycke"
      : isCampaignSheet && selectedMachineIds.size === 0
        ? "Välj minst en maskin för kampanjbladet"
        : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Skicka kampanj / kampanjblad</CardTitle>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/messages/campaigns">Skapa ny mall</Link>}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inga mallar finns ännu. Skapa en under Utskick → Kampanj.
          </p>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Mall</Label>
              <Select
                value={selectedTemplateKey}
                onValueChange={(v) => v && setSelectedTemplateKey(v)}
                items={Object.fromEntries(
                  templates.map((t) => [t.key, `${LEGAL_BASIS_GROUP_LABEL[t.legalBasis] ?? t.legalBasis} — ${t.key}`])
                )}
              >
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {LEGAL_BASIS_GROUP_LABEL[t.legalBasis] ?? t.legalBasis} — {t.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCampaignSheet && (
              <div className="space-y-1.5">
                <Label>Maskiner (kampanjbladet mailas per ikryssad maskin)</Label>
                {machines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Kunden har inga registrerade maskiner.</p>
                ) : (
                  <div className="space-y-1.5 border rounded-md p-3">
                    {machines.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedMachineIds.has(m.id)}
                          onCheckedChange={() => toggleMachine(m.id)}
                        />
                        {m.label} ({m.serialNumber})
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border rounded-md p-3 bg-muted/30 text-sm leading-relaxed whitespace-pre-line max-h-48 overflow-auto">
              {previewText}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" onClick={handleMail} disabled={mailDisabled} title={mailDisabledReason ?? undefined}>
                <Mail />
                {isPending ? "Skickar…" : "Maila"}
              </Button>
              {mailDisabledReason && <p className="text-xs text-muted-foreground">{mailDisabledReason}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
