"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintButton } from "@/components/print-button";
import { sendCampaignSheetEmail } from "@/app/machines/[id]/campaign-sheet/actions";

export interface CampaignSheetOption {
  key: string;
  renderedBody: string;
}

export function CampaignSheetView({
  machineId,
  options,
  hasEmail,
  hasConsent,
  header,
}: {
  machineId: string;
  options: CampaignSheetOption[];
  hasEmail: boolean;
  hasConsent: boolean;
  header: React.ReactNode;
}) {
  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? "");
  const [isPending, startTransition] = useTransition();

  const selected = options.find((o) => o.key === selectedKey) ?? options[0];

  function handleMail() {
    startTransition(async () => {
      try {
        await sendCampaignSheetEmail(machineId, selectedKey);
        toast.success("Kampanjbladet mailat.");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  const mailDisabled = isPending || !hasEmail || !hasConsent || !selected;
  const mailDisabledReason = !hasEmail
    ? "Kunden saknar e-postadress"
    : !hasConsent
      ? "Kunden har inte lämnat marknadsföringssamtycke"
      : null;

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">
        Inga kampanjblad finns ännu. Skapa ett under Inställningar → Kampanjblad.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center gap-2 flex-wrap">
        {options.length > 1 && (
          <Select
            value={selectedKey}
            onValueChange={(v) => v && setSelectedKey(v)}
            items={Object.fromEntries(options.map((o) => [o.key, o.key]))}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.key} value={o.key}>
                  {o.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <PrintButton />
        <Button type="button" variant="outline" onClick={handleMail} disabled={mailDisabled} title={mailDisabledReason ?? undefined}>
          <Mail />
          {isPending ? "Skickar…" : "Maila"}
        </Button>
        {mailDisabledReason && <p className="text-xs text-muted-foreground">{mailDisabledReason}</p>}
      </div>

      <div className="border rounded-lg p-10 bg-white text-black space-y-10 print:border-0 print:rounded-none print:p-0">
        {header}
        <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">{selected.renderedBody}</div>
      </div>
    </div>
  );
}
